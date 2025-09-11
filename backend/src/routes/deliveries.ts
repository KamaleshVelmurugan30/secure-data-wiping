import express from 'express';
import { z } from 'zod';
import { prisma } from '../server.js';
import { validateRequest } from '../middleware/validation.js';
import { authenticate } from '../middleware/auth.js';
import { queueDelivery } from '../services/bullmq.js';

const router = express.Router();

const createDeliverySchema = z.object({
  jobId: z.string(),
  partnerId: z.string(),
  method: z.enum(['WEBHOOK', 'EMAIL', 'API']),
});

// Create delivery
router.post('/', authenticate(['ADMIN', 'OPERATOR']), validateRequest(createDeliverySchema), async (req, res) => {
  try {
    const { jobId, partnerId, method } = req.body;

    const delivery = await prisma.delivery.create({
      data: { jobId, partnerId, method },
    });

    await queueDelivery(delivery.id);

    res.status(201).json({ delivery });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get delivery status
router.get('/:id', authenticate(), async (req, res) => {
  try {
    const delivery = await prisma.delivery.findUnique({
      where: { id: req.params.id },
      include: { job: true, partner: true },
    });

    if (!delivery) {
      return res.status(404).json({ error: 'Delivery not found' });
    }

    res.json({ delivery });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;