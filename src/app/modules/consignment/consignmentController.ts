import { FastifyReply, FastifyRequest } from "fastify"
import { requestMeta } from "@/core/helpers/requestMeta"
import { IdParams } from "../shared/schema"
import { toDate } from "../shared/utils"
import {
  CloseConsignment,
  CreateConsignment,
  ListConsignmentQuery,
  UpdateConsignment,
} from "./consignmentSchema"
import { ConsignmentService } from "./consignmentService"

export const ConsignmentController = {
  async list(req: FastifyRequest, reply: FastifyReply) {
    const meta = requestMeta(req)
    const query = req.query as ListConsignmentQuery
    const data = await ConsignmentService.list(meta.tenantId, query)
    reply.send({ success: true, data })
  },

  async getById(req: FastifyRequest, reply: FastifyReply) {
    const meta = requestMeta(req)
    const params = req.params as IdParams
    const data = await ConsignmentService.getById(meta.tenantId, params.id)
    reply.send({ success: true, data })
  },

  async create(req: FastifyRequest, reply: FastifyReply) {
    const meta = requestMeta(req)
    const payload = req.body as CreateConsignment
    const data = await ConsignmentService.create(meta.tenantId, meta.userId, {
      ...payload,
      arrivalDate: toDate(payload.arrivalDate),
    })
    reply.status(201).send({ success: true, data })
  },

  async update(req: FastifyRequest, reply: FastifyReply) {
    const meta = requestMeta(req)
    const params = req.params as IdParams
    const payload = req.body as UpdateConsignment
    const { arrivalDate, ...rest } = payload
    const data = await ConsignmentService.update(meta.tenantId, params.id, {
      ...rest,
      ...(arrivalDate ? { arrivalDate: toDate(arrivalDate) } : {}),
    })
    reply.send({ success: true, data })
  },

  async remove(req: FastifyRequest, reply: FastifyReply) {
    const meta = requestMeta(req)
    const params = req.params as IdParams
    const data = await ConsignmentService.remove(meta.tenantId, params.id)
    reply.send({ success: true, data })
  },

  async close(req: FastifyRequest, reply: FastifyReply) {
    const meta = requestMeta(req)
    const params = req.params as IdParams
    const payload = req.body as CloseConsignment
    const data = await ConsignmentService.close(meta.tenantId, params.id, meta.userId, payload.notes)
    reply.send({ success: true, data })
  },
}
