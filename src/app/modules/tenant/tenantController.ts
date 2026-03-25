import { FastifyReply, FastifyRequest } from "fastify"
import { requestMeta } from "@/core/helpers/requestMeta"
import { parseSchema } from "../shared/schema"
import { updateTenantSchema } from "./tenantSchema"
import { TenantService } from "./tenantService"

export const TenantController = {
  async getCurrent(req: FastifyRequest, reply: FastifyReply) {
    const meta = requestMeta(req)
    const data = await TenantService.getCurrent(meta.tenantId)
    reply.send({ success: true, data })
  },

  async updateCurrent(req: FastifyRequest, reply: FastifyReply) {
    const meta = requestMeta(req)
    const payload = parseSchema(updateTenantSchema, req.body)
    const data = await TenantService.updateCurrent(meta.tenantId, payload)
    reply.send({ success: true, data })
  },
}
