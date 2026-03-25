import { FastifyReply, FastifyRequest } from "fastify"
import { requestMeta } from "@/core/helpers/requestMeta"
import { IdParams } from "../shared/schema"
import { CreateSupplier, ListSupplierQuery, UpdateSupplier } from "./supplierSchema"
import { SupplierService } from "./supplierService"

export const SupplierController = {
  async list(req: FastifyRequest, reply: FastifyReply) {
    const meta = requestMeta(req)
    const query = req.query as ListSupplierQuery
    const data = await SupplierService.list(meta.tenantId, query)
    reply.send({ success: true, data })
  },

  async getById(req: FastifyRequest, reply: FastifyReply) {
    const meta = requestMeta(req)
    const params = req.params as IdParams
    const data = await SupplierService.getById(meta.tenantId, params.id)
    reply.send({ success: true, data })
  },

  async create(req: FastifyRequest, reply: FastifyReply) {
    const meta = requestMeta(req)
    const payload = req.body as CreateSupplier
    const data = await SupplierService.create(meta.tenantId, payload)
    reply.status(201).send({ success: true, data })
  },

  async update(req: FastifyRequest, reply: FastifyReply) {
    const meta = requestMeta(req)
    const params = req.params as IdParams
    const payload = req.body as UpdateSupplier
    const data = await SupplierService.update(meta.tenantId, params.id, payload)
    reply.send({ success: true, data })
  },

  async remove(req: FastifyRequest, reply: FastifyReply) {
    const meta = requestMeta(req)
    const params = req.params as IdParams
    const data = await SupplierService.remove(meta.tenantId, params.id)
    reply.send({ success: true, data })
  },
}
