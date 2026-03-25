import { FastifyReply, FastifyRequest } from "fastify"
import { requestMeta } from "@/core/helpers/requestMeta"
import { idParamSchema, parseSchema } from "../shared/schema"
import { createPaymentSchema, listPaymentQuerySchema, updatePaymentSchema } from "./paymentSchema"
import { PaymentService } from "./paymentService"

export const PaymentController = {
  async list(req: FastifyRequest, reply: FastifyReply) {
    const meta = requestMeta(req)
    const query = parseSchema(listPaymentQuerySchema, req.query)
    const data = await PaymentService.list(meta.tenantId, query)
    reply.send({ success: true, data })
  },

  async getById(req: FastifyRequest, reply: FastifyReply) {
    const meta = requestMeta(req)
    const params = parseSchema(idParamSchema, req.params)
    const data = await PaymentService.getById(meta.tenantId, params.id)
    reply.send({ success: true, data })
  },

  async create(req: FastifyRequest, reply: FastifyReply) {
    const meta = requestMeta(req)
    const payload = parseSchema(createPaymentSchema, req.body)
    const data = await PaymentService.create(meta.tenantId, meta.userId, payload)
    reply.status(201).send({ success: true, data })
  },

  async update(req: FastifyRequest, reply: FastifyReply) {
    const meta = requestMeta(req)
    const params = parseSchema(idParamSchema, req.params)
    const payload = parseSchema(updatePaymentSchema, req.body)
    const data = await PaymentService.update(meta.tenantId, params.id, payload)
    reply.send({ success: true, data })
  },

  async remove(req: FastifyRequest, reply: FastifyReply) {
    const meta = requestMeta(req)
    const params = parseSchema(idParamSchema, req.params)
    const data = await PaymentService.remove(meta.tenantId, params.id)
    reply.send({ success: true, data })
  },
}
