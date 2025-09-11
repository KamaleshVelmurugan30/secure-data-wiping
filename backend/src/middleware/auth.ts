import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    email: string;
    role: string;
    agentId?: string;
  };
}

export const authenticate = (allowedRoles?: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const token = req.cookies['auth-token'] || req.headers.authorization?.replace('Bearer ', '');

      if (!token) {
        return res.status(401).json({ error: 'No token provided' });
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as any;
      
      if (allowedRoles && !allowedRoles.includes(decoded.role)) {
        return res.status(403).json({ error: 'Insufficient permissions' });
      }

      req.user = {
        userId: decoded.userId,
        email: decoded.email,
        role: decoded.role,
        agentId: decoded.agentId,
      };

      next();
    } catch (error) {
      return res.status(401).json({ error: 'Invalid token' });
    }
  };
};