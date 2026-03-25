import { FastifyReply, FastifyRequest } from "fastify"
import { requestMeta } from "@/core/helpers/requestMeta"
import { IdParams } from "../shared/schema"
import { toDate } from "../shared/utils"
import { CreatePayment, ListPaymentQuery, UpdatePayment } from "./paymentSchema"
import { PaymentService } from "./paymentService"

export const PaymentController = {
  async list(req: FastifyRequest, reply: FastifyReply) {
    const meta = requestMeta(req)
    const query = req.query as ListPaymentQuery
    const data = await PaymentService.list(meta.tenantId, query)
    reply.send({ success: true, data })
  },

  async getById(req: FastifyRequest, reply: FastifyReply) {
    const meta = requestMeta(req)
    const params = req.params as IdParams
    const data = await PaymentService.getById(meta.tenantId, params.id)
    reply.send({ success: true, data })
  },

  async create(req: FastifyRequest, reply: FastifyReply) {
    const meta = requestMeta(req)
    const payload = req.body as CreatePayment
    const data = await PaymentService.create(meta.tenantId, meta.userId, {
      ...payload,
      paymentDate: toDate(payload.paymentDate),
    })
    reply.status(201).send({ success: true, data })
  },

  async update(req: FastifyRequest, reply: FastifyReply) {
    const meta = requestMeta(req)
    const params = req.params as IdParams
    const payload = req.body as UpdatePayment
    const { paymentDate, ...rest } = payload
    const data = await PaymentService.update(meta.tenantId, params.id, {
      ...rest,
      ...(paymentDate ? { paymentDate: toDate(paymentDate) } : {}),
    })
    reply.send({ success: true, data })
  },

  async remove(req: FastifyRequest, reply: FastifyReply) {
    const meta = requestMeta(req)
    const params = req.params as IdParams
    const data = await PaymentService.remove(meta.tenantId, params.id)
    reply.send({ success: true, data })
  },
}
