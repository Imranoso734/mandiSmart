import { FastifyReply, FastifyRequest } from "fastify"
import { requestMeta } from "@/core/helpers/requestMeta"
import { idParamSchema, parseSchema } from "../shared/schema"
import { createCustomerSchema, listCustomerQuerySchema, updateCustomerSchema } from "./customerSchema"
import { CustomerService } from "./customerService"

export const CustomerController = {
  async list(req: FastifyRequest, reply: FastifyReply) {
    const meta = requestMeta(req)
    const query = parseSchema(listCustomerQuerySchema, req.query)
    const data = await CustomerService.list(meta.tenantId, query)
    reply.send({ success: true, data })
  },

  async getById(req: FastifyRequest, reply: FastifyReply) {
    const meta = requestMeta(req)
    const params = parseSchema(idParamSchema, req.params)
    const data = await CustomerService.getById(meta.tenantId, params.id)
    reply.send({ success: true, data })
  },

  async create(req: FastifyRequest, reply: FastifyReply) {
    const meta = requestMeta(req)
    const payload = parseSchema(createCustomerSchema, req.body)
    const data = await CustomerService.create(meta.tenantId, payload)
    reply.status(201).send({ success: true, data })
  },

  async update(req: FastifyRequest, reply: FastifyReply) {
    const meta = requestMeta(req)
    const params = parseSchema(idParamSchema, req.params)
    const payload = parseSchema(updateCustomerSchema, req.body)
    const data = await CustomerService.update(meta.tenantId, params.id, payload)
    reply.send({ success: true, data })
  },

  async remove(req: FastifyRequest, reply: FastifyReply) {
    const meta = requestMeta(req)
    const params = parseSchema(idParamSchema, req.params)
    const data = await CustomerService.remove(meta.tenantId, params.id)
    reply.send({ success: true, data })
  },
}
