
import { FastifyRequest, FastifyReply } from 'fastify';
import { AppError } from '../errors/AppError.js';

export const rolesHierarchy: Record<string, number> = {
  guest: 0,
  student: 1,
  signals_member: 1,
  mentor: 2,
  admin: 3,
  super_admin: 4,
};

export const requireRole = (minRole: string) => {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    if (!request.user) {
      throw new AppError('UNAUTHORIZED', 401, 'User not authenticated');
    }

    const userRoleLevel = rolesHierarchy[request.user.role] ?? 0;
    const requiredRoleLevel = rolesHierarchy[minRole] ?? 0;

    if (userRoleLevel < requiredRoleLevel) {
      throw new AppError('FORBIDDEN', 403, 'Insufficient permissions');
    }
  };
};

export const requireSubscription = (allowedTypes: string[]) => {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    // This will be implemented when we have subscription logic
    // For now, it's a placeholder
    return;
  };
};
