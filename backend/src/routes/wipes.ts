import express from 'express';
import multer from 'multer';
import { z } from 'zod';
import { prisma } from '../server.js';
import { validateRequest } from '../middleware/validation.js';
import { authenticate } from '../middleware/auth.js';
import { NistMapper } from '../services/nistMapper.js';
import { auditLog } from '../services/audit.js';
import { queueBlockchainAnchor, queueDelivery } from '../services/bullmq.js';

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

const createWipeSchema = z.object({
  assetId: z.string().optional(),
  scope: z.enum(['DRIVE', 'FOLDER']),
  target: z.string(),
  policy: z.object({
    nistCategory: z.enum(['CLEAR', 'PURGE', 'DESTROY']),
    method: z.enum(['OVERWRITE', 'ATA_SECURE_ERASE', 'NVME_SANITIZE', 'CRYPTO_ERASE']).optional(),
    overwritePasses: z.number().optional(),
    verifySamplePercent: z.number().min(0).max(100).optional(),
  }),
  assignToAgentId: z.string().optional(),
  confirm: z.boolean(),
});

const updateStatusSchema = z.object({
  status: z.enum(['QUEUED', 'RUNNING', 'SUCCEEDED', 'FAILED', 'CANCELLED']),
  progress: z.number().min(0).max(100).optional(),
  error: z.string().optional(),
  runLogSha256: z.string().optional(),
});

// Create wipe job
router.post('/', authenticate(['ADMIN', 'OPERATOR']), validateRequest(createWipeSchema), async (req, res) => {
  try {
    const { assetId, scope, target, policy, assignToAgentId, confirm } = req.body;

    if (!confirm) {
      return res.status(400).json({ error: 'Confirmation required for destructive operation' });
    }

    // Get asset info if provided
    let asset = null;
    if (assetId) {
      asset = await prisma.asset.findUnique({ where: { id: assetId } });
      if (!asset) {
        return res.status(404).json({ error: 'Asset not found' });
      }
    }

    // Map to recommended method based on media type and NIST category
    const nistMapper = new NistMapper();
    const recommendations = nistMapper.getRecommendations(
      asset?.mediaType || 'HDD',
      scope,
      policy.nistCategory
    );

    const method = policy.method || recommendations.recommendedMethod;

    // Create wipe job
    const wipeJob = await prisma.wipeJob.create({
      data: {
        assetId,
        scope,
        targetPathOrDrive: target,
        nistCategory: policy.nistCategory,
        method,
        requestedBy: req.user.userId,
        assignedAgentId,
        policyJson: {
          ...policy,
          method,
          recommendations,
        },
      },
      include: {
        asset: true,
        requestedByUser: {
          select: { id: true, email: true, role: true },
        },
        assignedAgent: true,
      },
    });

    // Audit log
    await auditLog(req.user.userId, 'WIPE_JOB_CREATED', {
      jobId: wipeJob.id,
      target,
      method,
      nistCategory: policy.nistCategory,
    });

    res.status(201).json({ wipeJob });
  } catch (error) {
    console.error('Error creating wipe job:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get wipe job details
router.get('/:id', authenticate(), async (req, res) => {
  try {
    const wipeJob = await prisma.wipeJob.findUnique({
      where: { id: req.params.id },
      include: {
        asset: true,
        requestedByUser: {
          select: { id: true, email: true, role: true },
        },
        assignedAgent: true,
        wipeResult: true,
        certificate: true,
        blockchainRecord: true,
        deliveries: {
          include: { partner: true },
        },
      },
    });

    if (!wipeJob) {
      return res.status(404).json({ error: 'Wipe job not found' });
    }

    res.json({ wipeJob });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// List wipe jobs
router.get('/', authenticate(), async (req, res) => {
  try {
    const { status, assignedAgentId, limit = '50', offset = '0' } = req.query;

    const where: any = {};
    if (status) where.status = status;
    if (assignedAgentId) where.assignedAgentId = assignedAgentId;

    const wipeJobs = await prisma.wipeJob.findMany({
      where,
      include: {
        asset: true,
        requestedByUser: {
          select: { id: true, email: true, role: true },
        },
        assignedAgent: true,
      },
      orderBy: { createdAt: 'desc' },
      take: parseInt(limit as string),
      skip: parseInt(offset as string),
    });

    const total = await prisma.wipeJob.count({ where });

    res.json({
      wipeJobs,
      pagination: {
        total,
        limit: parseInt(limit as string),
        offset: parseInt(offset as string),
      },
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update wipe job status (agent endpoint)
router.patch('/:id/status', authenticate(), validateRequest(updateStatusSchema), async (req, res) => {
  try {
    const { status, progress, error, runLogSha256 } = req.body;

    const wipeJob = await prisma.wipeJob.findUnique({
      where: { id: req.params.id },
    });

    if (!wipeJob) {
      return res.status(404).json({ error: 'Wipe job not found' });
    }

    // Validate agent assignment for non-admin users
    if (req.user.role !== 'ADMIN' && wipeJob.assignedAgentId !== req.user.agentId) {
      return res.status(403).json({ error: 'Not authorized to update this job' });
    }

    const updateData: any = {
      status,
      updatedAt: new Date(),
    };

    if (status === 'RUNNING' && !wipeJob.startedAt) {
      updateData.startedAt = new Date();
    }

    if (['SUCCEEDED', 'FAILED', 'CANCELLED'].includes(status)) {
      updateData.finishedAt = new Date();
    }

    if (runLogSha256) {
      updateData.runLogSha256 = runLogSha256;
    }

    const updatedJob = await prisma.wipeJob.update({
      where: { id: req.params.id },
      data: updateData,
    });

    res.json({ wipeJob: updatedJob });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Upload wipe result (agent endpoint)
router.put(
  '/:id/result',
  authenticate(),
  upload.fields([
    { name: 'certificatePdf', maxCount: 1 },
    { name: 'certificateJson', maxCount: 1 },
    { name: 'pkcs7', maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const { json } = req.body;
      const files = req.files as { [fieldname: string]: Express.Multer.File[] };

      if (!json) {
        return res.status(400).json({ error: 'JSON result data required' });
      }

      const resultData = JSON.parse(json);

      const wipeJob = await prisma.wipeJob.findUnique({
        where: { id: req.params.id },
      });

      if (!wipeJob) {
        return res.status(404).json({ error: 'Wipe job not found' });
      }

      // Store wipe result
      const wipeResult = await prisma.wipeResult.create({
        data: {
          jobId: req.params.id,
          deviceInfoJson: resultData.deviceInfo,
          metricsJson: resultData.metrics,
          proofJson: resultData.proof,
          pdfUrl: files.certificatePdf?.[0]?.path,
          jsonUrl: files.certificateJson?.[0]?.path,
        },
      });

      // Create certificate record
      const certificate = await prisma.certificate.create({
        data: {
          jobId: req.params.id,
          jsonBlob: resultData,
          pkcs7Url: files.pkcs7?.[0]?.path,
          hash: resultData.hash || 'placeholder-hash',
          status: 'VERIFIED',
        },
      });

      // Queue blockchain anchoring
      await queueBlockchainAnchor(req.params.id, certificate.hash);

      res.json({ wipeResult, certificate });
    } catch (error) {
      console.error('Error uploading wipe result:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

export default router;