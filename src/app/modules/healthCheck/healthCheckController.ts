import { FastifyReply, FastifyRequest } from "fastify"
import { HealthCheckService } from "./healthCheckService"

export const HealthCheckController = {
  async status(_req: FastifyRequest, reply: FastifyReply) {
    const data = await HealthCheckService.status()
    reply.send({ success: true, data })
  },
}
