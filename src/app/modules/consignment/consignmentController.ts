import { FastifyReply, FastifyRequest } from "fastify"
import { requestMeta } from "@/core/helpers/requestMeta"
import { idParamSchema, parseSchema } from "../shared/schema"
import {
  closeConsignmentSchema,
  createConsignmentSchema,
  listConsignmentQuerySchema,
  updateConsignmentSchema,
} from "./consignmentSchema"
import { ConsignmentService } from "./consignmentService"

export const ConsignmentController = {
  async list(req: FastifyRequest, reply: FastifyReply) {
    const meta = requestMeta(req)
    const query = parseSchema(listConsignmentQuerySchema, req.query)
    const data = await ConsignmentService.list(meta.tenantId, query)
    reply.send({ success: true, data })
  },

  async getById(req: FastifyRequest, reply: FastifyReply) {
    const meta = requestMeta(req)
    const params = parseSchema(idParamSchema, req.params)
    const data = await ConsignmentService.getById(meta.tenantId, params.id)
    reply.send({ success: true, data })
  },

  async create(req: FastifyRequest, reply: FastifyReply) {
    const meta = requestMeta(req)
    const payload = parseSchema(createConsignmentSchema, req.body)
    const data = await ConsignmentService.create(meta.tenantId, meta.userId, payload)
    reply.status(201).send({ success: true, data })
  },

  async update(req: FastifyRequest, reply: FastifyReply) {
    const meta = requestMeta(req)
    const params = parseSchema(idParamSchema, req.params)
    const payload = parseSchema(updateConsignmentSchema, req.body)
    const data = await ConsignmentService.update(meta.tenantId, params.id, payload)
    reply.send({ success: true, data })
  },

  async remove(req: FastifyRequest, reply: FastifyReply) {
    const meta = requestMeta(req)
    const params = parseSchema(idParamSchema, req.params)
    const data = await ConsignmentService.remove(meta.tenantId, params.id)
    reply.send({ success: true, data })
  },

  async close(req: FastifyRequest, reply: FastifyReply) {
    const meta = requestMeta(req)
    const params = parseSchema(idParamSchema, req.params)
    const payload = parseSchema(closeConsignmentSchema, req.body)
    const data = await ConsignmentService.close(meta.tenantId, params.id, meta.userId, payload.notes)
    reply.send({ success: true, data })
  },
}
