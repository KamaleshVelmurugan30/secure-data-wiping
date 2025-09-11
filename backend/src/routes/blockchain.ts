import express from 'express';
import { z } from 'zod';
import { prisma } from '../server.js';
import { validateRequest } from '../middleware/validation.js';
import { authenticate } from '../middleware/auth.js';
import { queueBlockchainAnchor } from '../services/bullmq.js';
import { BlockchainClient } from '../services/blockchainClient.js';

const router = express.Router();

const anchorSchema = z.object({
  certificateId: z.string(),
});

// Anchor certificate hash on blockchain
router.post('/anchor', authenticate(['ADMIN', 'OPERATOR']), validateRequest(anchorSchema), async (req, res) => {
  try {
    const { certificateId } = req.body;

    const certificate = await prisma.certificate.findUnique({
      where: { id: certificateId },
    });

    if (!certificate) {
      return res.status(404).json({ error: 'Certificate not found' });
    }

    await queueBlockchainAnchor(certificate.jobId, certificate.hash);

    res.json({ message: 'Blockchain anchoring queued', hash: certificate.hash });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get blockchain record by transaction hash
router.get('/record/:txHash', authenticate(), async (req, res) => {
  try {
    const record = await prisma.blockchainRecord.findFirst({
      where: { txHash: req.params.txHash },
      include: { job: true },
    });

    if (!record) {
      return res.status(404).json({ error: 'Blockchain record not found' });
    }

    // Verify on-chain if needed
    const blockchainClient = new BlockchainClient();
    const isValid = await blockchainClient.verifyAnchor(record.txHash!);

    res.json({ record, verified: isValid });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;