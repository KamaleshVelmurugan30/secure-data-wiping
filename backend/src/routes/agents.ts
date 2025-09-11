import express from 'express';
import { z } from 'zod';
import { prisma } from '../server.js';
import { validateRequest } from '../middleware/validation.js';
import { authenticate } from '../middleware/auth.js';
import { generateAgentToken } from '../services/tokenService.js';

const router = express.Router();

const enrollAgentSchema = z.object({
  name: z.string(),
  os: z.string(),
  version: z.string(),
  publicKey: z.string().optional(),
  mtlsCert: z.string().optional(),
});

// Enroll new agent
router.post('/enroll', validateRequest(enrollAgentSchema), async (req, res) => {
  try {
    const { name, os, version, publicKey, mtlsCert } = req.body;

    const agent = await prisma.agent.create({
      data: {
        name,
        os,
        version,
        publicKey,
        mtlsCert,
        status: 'ONLINE',
      },
    });

    const token = generateAgentToken(agent.id, agent.name);

    res.status(201).json({
      agent: {
        id: agent.id,
        name: agent.name,
        status: agent.status,
      },
      token,
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get agent jobs (agent polling endpoint)
router.get('/:id/jobs', async (req, res) => {
  try {
    const { status = 'QUEUED' } = req.query;
    const agentId = req.params.id;

    // Update agent last seen
    await prisma.agent.update({
      where: { id: agentId },
      data: { lastSeen: new Date() },
    });

    // Get next job for this agent
    const job = await prisma.wipeJob.findFirst({
      where: {
        status: status as any,
        assignedAgentId: agentId,
      },
      include: {
        asset: true,
        requestedByUser: {
          select: { id: true, email: true },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    if (!job) {
      return res.json({ job: null });
    }

    res.json({ job });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// List agents (admin only)
router.get('/', authenticate(['ADMIN']), async (req, res) => {
  try {
    const agents = await prisma.agent.findMany({
      include: {
        _count: {
          select: {
            wipeJobs: {
              where: {
                status: { in: ['QUEUED', 'RUNNING'] },
              },
            },
          },
        },
      },
      orderBy: { enrolledAt: 'desc' },
    });

    res.json({ agents });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update agent status
router.patch('/:id/status', authenticate(['ADMIN']), async (req, res) => {
  try {
    const { status } = req.body;
    
    const agent = await prisma.agent.update({
      where: { id: req.params.id },
      data: { status },
    });

    res.json({ agent });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;