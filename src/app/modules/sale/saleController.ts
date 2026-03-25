import { FastifyReply, FastifyRequest } from "fastify"
import { requestMeta } from "@/core/helpers/requestMeta"
import { IdParams } from "../shared/schema"
import { toDate } from "../shared/utils"
import { CreateSale, ListSaleQuery, UpdateSale } from "./saleSchema"
import { SaleService } from "./saleService"

export const SaleController = {
  async list(req: FastifyRequest, reply: FastifyReply) {
    const meta = requestMeta(req)
    const query = req.query as ListSaleQuery
    const data = await SaleService.list(meta.tenantId, query)
    reply.send({ success: true, data })
  },

  async getById(req: FastifyRequest, reply: FastifyReply) {
    const meta = requestMeta(req)
    const params = req.params as IdParams
    const data = await SaleService.getById(meta.tenantId, params.id)
    reply.send({ success: true, data })
  },

  async create(req: FastifyRequest, reply: FastifyReply) {
    const meta = requestMeta(req)
    const payload = req.body as CreateSale
    const data = await SaleService.create(meta.tenantId, meta.userId, {
      ...payload,
      saleDate: toDate(payload.saleDate),
    })
    reply.status(201).send({ success: true, data })
  },

  async update(req: FastifyRequest, reply: FastifyReply) {
    const meta = requestMeta(req)
    const params = req.params as IdParams
    const payload = req.body as UpdateSale
    const { saleDate, ...rest } = payload
    const data = await SaleService.update(meta.tenantId, params.id, {
      ...rest,
      ...(saleDate ? { saleDate: toDate(saleDate) } : {}),
    })
    reply.send({ success: true, data })
  },

  async remove(req: FastifyRequest, reply: FastifyReply) {
    const meta = requestMeta(req)
    const params = req.params as IdParams
    const data = await SaleService.remove(meta.tenantId, params.id)
    reply.send({ success: true, data })
  },
}
