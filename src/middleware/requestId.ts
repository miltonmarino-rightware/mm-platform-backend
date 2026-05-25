
import { FastifyRequest, FastifyReply, HookHandlerDoneFunction } from 'fastify';
import { randomUUID } from 'crypto';

export const requestIdMiddleware = (
  request: FastifyRequest,
  reply: FastifyReply,
  done: HookHandlerDoneFunction
) => {
  const id = request.headers['x-request-id'] || randomUUID();
  request.id = id as string;
  reply.header('x-request-id', id);
  done();
};
