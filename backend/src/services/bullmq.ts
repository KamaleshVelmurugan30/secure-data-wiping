import { Queue, Worker } from 'bullmq';
import IORedis from 'ioredis';
import { prisma } from '../server.js';
import { BlockchainClient } from './blockchainClient.js';
import { RecyclerDelivery } from './recyclerDelivery.js';

const connection = new IORedis(process.env.REDIS_URL || 'redis://localhost:6379', {
  maxRetriesPerRequest: 3,
});

// Queues
export const blockchainQueue = new Queue('blockchain', { connection });
export const deliveryQueue = new Queue('delivery', { connection });

// Blockchain worker
const blockchainWorker = new Worker(
  'blockchain',
  async (job) => {
    const { jobId, certHash } = job.data;
    
    try {
      const blockchainClient = new BlockchainClient();
      const result = await blockchainClient.anchorCertificate(certHash);
      
      await prisma.blockchainRecord.update({
        where: { jobId },
        data: {
          txHash: result.txHash,
          blockNumber: BigInt(result.blockNumber),
          status: 'CONFIRMED',
        },
      });
      
      return result;
    } catch (error) {
      await prisma.blockchainRecord.update({
        where: { jobId },
        data: { status: 'FAILED' },
      });
      throw error;
    }
  },
  {
    connection,
    concurrency: 5,
  }
);

// Delivery worker
const deliveryWorker = new Worker(
  'delivery',
  async (job) => {
    const { deliveryId } = job.data;
    
    try {
      const delivery = await prisma.delivery.findUnique({
        where: { id: deliveryId },
        include: {
          job: {
            include: {
              wipeResult: true,
              certificate: true,
            },
          },
          partner: true,
        },
      });
      
      if (!delivery) {
        throw new Error('Delivery not found');
      }
      
      const recyclerDelivery = new RecyclerDelivery();
      await recyclerDelivery.deliver(delivery);
      
      await prisma.delivery.update({
        where: { id: deliveryId },
        data: {
          status: 'DELIVERED',
          attempts: delivery.attempts + 1,
        },
      });
      
      return { status: 'delivered' };
    } catch (error) {
      const delivery = await prisma.delivery.findUnique({
        where: { id: deliveryId },
      });
      
      await prisma.delivery.update({
        where: { id: deliveryId },
        data: {
          status: 'FAILED',
          attempts: (delivery?.attempts || 0) + 1,
          lastError: error instanceof Error ? error.message : 'Unknown error',
        },
      });
      
      throw error;
    }
  },
  {
    connection,
    concurrency: 3,
  }
);

// Queue job functions
export const queueBlockchainAnchor = async (jobId: string, certHash: string) => {
  // Create blockchain record
  await prisma.blockchainRecord.create({
    data: {
      jobId,
      certHash,
      status: 'PENDING',
    },
  });
  
  await blockchainQueue.add(
    'anchor',
    { jobId, certHash },
    {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 2000,
      },
    }
  );
};

export const queueDelivery = async (deliveryId: string) => {
  await deliveryQueue.add(
    'deliver',
    { deliveryId },
    {
      attempts: 5,
      backoff: {
        type: 'exponential',
        delay: 5000,
      },
    }
  );
};

export const setupBullMQ = async () => {
  console.log('BullMQ workers started');
  
  blockchainWorker.on('completed', (job) => {
    console.log(`Blockchain job ${job.id} completed`);
  });
  
  blockchainWorker.on('failed', (job, err) => {
    console.error(`Blockchain job ${job?.id} failed:`, err);
  });
  
  deliveryWorker.on('completed', (job) => {
    console.log(`Delivery job ${job.id} completed`);
  });
  
  deliveryWorker.on('failed', (job, err) => {
    console.error(`Delivery job ${job?.id} failed:`, err);
  });
};