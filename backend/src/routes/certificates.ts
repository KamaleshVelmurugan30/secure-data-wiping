import express from 'express';
import multer from 'multer';
import { z } from 'zod';
import { prisma } from '../server.js';
import { validateRequest } from '../middleware/validation.js';
import { authenticate } from '../middleware/auth.js';
import { PKCS7Verify } from '../services/pkcs7Verify.js';
import { auditLog } from '../services/audit.js';

const router = express.Router();
const upload = multer({ dest: 'uploads/certificates/' });

const uploadCertificateSchema = z.object({
  jobId: z.string().optional(),
  nistCategory: z.enum(['CLEAR', 'PURGE', 'DESTROY']),
  description: z.string().optional(),
});

// Upload and verify certificate
router.post(
  '/upload',
  authenticate(['ADMIN', 'OPERATOR']),
  upload.fields([
    { name: 'certificateJson', maxCount: 1 },
    { name: 'certificatePdf', maxCount: 1 },
    { name: 'pkcs7Signature', maxCount: 1 },
  ]),
  validateRequest(uploadCertificateSchema),
  async (req, res) => {
    try {
      const { jobId, nistCategory, description } = req.body;
      const files = req.files as { [fieldname: string]: Express.Multer.File[] };

      if (!files.certificateJson) {
        return res.status(400).json({ error: 'Certificate JSON file required' });
      }

      // Read certificate data
      const fs = await import('fs/promises');
      const certificateData = JSON.parse(
        await fs.readFile(files.certificateJson[0].path, 'utf8')
      );

      let verificationResult = null;
      let caDetails = null;

      // Verify PKCS#7 signature if provided
      if (files.pkcs7Signature) {
        const pkcs7Verify = new PKCS7Verify();
        verificationResult = await pkcs7Verify.verify(
          files.certificateJson[0].path,
          files.pkcs7Signature[0].path
        );
        caDetails = verificationResult.caDetails;
      }

      // Calculate certificate hash
      const crypto = await import('crypto');
      const hash = crypto
        .createHash('sha256')
        .update(JSON.stringify(certificateData))
        .digest('hex');

      // Store certificate
      const certificate = await prisma.certificate.create({
        data: {
          jobId,
          jsonBlob: certificateData,
          pkcs7Url: files.pkcs7Signature?.[0]?.path,
          hash,
          status: verificationResult?.valid ? 'VERIFIED' : 'INVALID',
          caDetailsJson: caDetails,
        },
      });

      // Audit log
      await auditLog(req.user!.userId, 'CERTIFICATE_UPLOADED', {
        certificateId: certificate.id,
        jobId,
        verified: verificationResult?.valid || false,
      });

      res.status(201).json({
        certificate: {
          id: certificate.id,
          hash: certificate.hash,
          status: certificate.status,
          verified: verificationResult?.valid || false,
        },
        verification: verificationResult,
      });
    } catch (error) {
      console.error('Error uploading certificate:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// Get certificate details
router.get('/:id', authenticate(), async (req, res) => {
  try {
    const certificate = await prisma.certificate.findUnique({
      where: { id: req.params.id },
      include: {
        job: {
          include: {
            asset: true,
            requestedByUser: {
              select: { id: true, email: true },
            },
          },
        },
      },
    });

    if (!certificate) {
      return res.status(404).json({ error: 'Certificate not found' });
    }

    res.json({ certificate });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Download certificate file
router.get('/:id/download/:type', authenticate(), async (req, res) => {
  try {
    const { type } = req.params;

    const certificate = await prisma.certificate.findUnique({
      where: { id: req.params.id },
      include: {
        job: {
          include: { wipeResult: true },
        },
      },
    });

    if (!certificate) {
      return res.status(404).json({ error: 'Certificate not found' });
    }

    let filePath: string | null = null;
    let contentType: string;
    let filename: string;

    switch (type) {
      case 'json':
        // Return JSON data directly
        res.setHeader('Content-Type', 'application/json');
        res.setHeader(
          'Content-Disposition',
          `attachment; filename="certificate-${certificate.id}.json"`
        );
        return res.json(certificate.jsonBlob);

      case 'pdf':
        filePath = certificate.job?.wipeResult?.pdfUrl || null;
        contentType = 'application/pdf';
        filename = `certificate-${certificate.id}.pdf`;
        break;

      case 'pkcs7':
        filePath = certificate.pkcs7Url;
        contentType = 'application/pkcs7-signature';
        filename = `certificate-${certificate.id}.p7s`;
        break;

      default:
        return res.status(400).json({ error: 'Invalid file type' });
    }

    if (!filePath) {
      return res.status(404).json({ error: 'File not found' });
    }

    const fs = await import('fs');
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'File not found on disk' });
    }

    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    
    const stream = fs.createReadStream(filePath);
    stream.pipe(res);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// List certificates
router.get('/', authenticate(), async (req, res) => {
  try {
    const { status, jobId, limit = '50', offset = '0' } = req.query;

    const where: any = {};
    if (status) where.status = status;
    if (jobId) where.jobId = jobId;

    const certificates = await prisma.certificate.findMany({
      where,
      include: {
        job: {
          include: {
            asset: true,
            requestedByUser: {
              select: { id: true, email: true },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: parseInt(limit as string),
      skip: parseInt(offset as string),
    });

    const total = await prisma.certificate.count({ where });

    res.json({
      certificates,
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

export default router;