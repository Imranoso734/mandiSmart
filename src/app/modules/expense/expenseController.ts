import { FastifyReply, FastifyRequest } from "fastify"
import { requestMeta } from "@/core/helpers/requestMeta"
import { idParamSchema, parseSchema } from "../shared/schema"
import { createExpenseSchema, listExpenseQuerySchema, updateExpenseSchema } from "./expenseSchema"
import { ExpenseService } from "./expenseService"

export const ExpenseController = {
  async list(req: FastifyRequest, reply: FastifyReply) {
    const meta = requestMeta(req)
    const query = parseSchema(listExpenseQuerySchema, req.query)
    const data = await ExpenseService.list(meta.tenantId, query)
    reply.send({ success: true, data })
  },

  async getById(req: FastifyRequest, reply: FastifyReply) {
    const meta = requestMeta(req)
    const params = parseSchema(idParamSchema, req.params)
    const data = await ExpenseService.getById(meta.tenantId, params.id)
    reply.send({ success: true, data })
  },

  async create(req: FastifyRequest, reply: FastifyReply) {
    const meta = requestMeta(req)
    const payload = parseSchema(createExpenseSchema, req.body)
    const data = await ExpenseService.create(meta.tenantId, meta.userId, payload)
    reply.status(201).send({ success: true, data })
  },

  async update(req: FastifyRequest, reply: FastifyReply) {
    const meta = requestMeta(req)
    const params = parseSchema(idParamSchema, req.params)
    const payload = parseSchema(updateExpenseSchema, req.body)
    const data = await ExpenseService.update(meta.tenantId, params.id, payload)
    reply.send({ success: true, data })
  },

  async remove(req: FastifyRequest, reply: FastifyReply) {
    const meta = requestMeta(req)
    const params = parseSchema(idParamSchema, req.params)
    const data = await ExpenseService.remove(meta.tenantId, params.id)
    reply.send({ success: true, data })
  },
}
