import jwt from 'jsonwebtoken';

export const generateAgentToken = (agentId: string, agentName: string): string => {
  return jwt.sign(
    {
      agentId,
      agentName,
      type: 'agent',
    },
    process.env.JWT_SECRET || 'your-secret-key',
    { expiresIn: '30d' }
  );
};

export const verifyAgentToken = (token: string) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
  } catch (error) {
    throw new Error('Invalid agent token');
  }
};