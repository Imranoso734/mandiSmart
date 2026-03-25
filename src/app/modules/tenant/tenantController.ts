import { FastifyReply, FastifyRequest } from "fastify"
import { requestMeta } from "@/core/helpers/requestMeta"
import { TenantService } from "./tenantService"
import { UpdateTenant } from "./tenantSchema"

export const TenantController = {
  async getCurrent(req: FastifyRequest, reply: FastifyReply) {
    const meta = requestMeta(req)
    const data = await TenantService.getCurrent(meta.tenantId)
    reply.send({ success: true, data })
  },

  async updateCurrent(req: FastifyRequest, reply: FastifyReply) {
    const meta = requestMeta(req)
    const payload = req.body as UpdateTenant
    const data = await TenantService.updateCurrent(meta.tenantId, payload)
    reply.send({ success: true, data })
  },
}
