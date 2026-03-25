import { FastifyReply, FastifyRequest } from "fastify"
import { requestMeta } from "@/core/helpers/requestMeta"
import { IdParams } from "../shared/schema"
import { toDate } from "../shared/utils"
import { CreateExpense, ListExpenseQuery, UpdateExpense } from "./expenseSchema"
import { ExpenseService } from "./expenseService"

export const ExpenseController = {
  async list(req: FastifyRequest, reply: FastifyReply) {
    const meta = requestMeta(req)
    const query = req.query as ListExpenseQuery
    const data = await ExpenseService.list(meta.tenantId, query)
    reply.send({ success: true, data })
  },

  async getById(req: FastifyRequest, reply: FastifyReply) {
    const meta = requestMeta(req)
    const params = req.params as IdParams
    const data = await ExpenseService.getById(meta.tenantId, params.id)
    reply.send({ success: true, data })
  },

  async create(req: FastifyRequest, reply: FastifyReply) {
    const meta = requestMeta(req)
    const payload = req.body as CreateExpense
    const data = await ExpenseService.create(meta.tenantId, meta.userId, {
      ...payload,
      expenseDate: toDate(payload.expenseDate),
    })
    reply.status(201).send({ success: true, data })
  },

  async update(req: FastifyRequest, reply: FastifyReply) {
    const meta = requestMeta(req)
    const params = req.params as IdParams
    const payload = req.body as UpdateExpense
    const { expenseDate, ...rest } = payload
    const data = await ExpenseService.update(meta.tenantId, params.id, {
      ...rest,
      ...(expenseDate ? { expenseDate: toDate(expenseDate) } : {}),
    })
    reply.send({ success: true, data })
  },

  async remove(req: FastifyRequest, reply: FastifyReply) {
    const meta = requestMeta(req)
    const params = req.params as IdParams
    const data = await ExpenseService.remove(meta.tenantId, params.id)
    reply.send({ success: true, data })
  },
}
