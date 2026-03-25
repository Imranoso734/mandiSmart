import { FastifyReply, FastifyRequest } from "fastify"
import { requestMeta } from "@/core/helpers/requestMeta"
import { idParamSchema, parseSchema } from "../shared/schema"
import { dailyReportQuerySchema, ledgerQuerySchema } from "./reportSchema"
import { ReportService } from "./reportService"

export const ReportController = {
  async dailySales(req: FastifyRequest, reply: FastifyReply) {
    const meta = requestMeta(req)
    const query = parseSchema(dailyReportQuerySchema, req.query)
    const data = await ReportService.dailySales(meta.tenantId, query.date)
    reply.send({ success: true, data })
  },

  async customerLedger(req: FastifyRequest, reply: FastifyReply) {
    const meta = requestMeta(req)
    const params = parseSchema(idParamSchema, req.params)
    const query = parseSchema(ledgerQuerySchema, req.query)
    const data = await ReportService.customerLedger(meta.tenantId, params.id, query.from, query.to)
    reply.send({ success: true, data })
  },

  async consignmentSummary(req: FastifyRequest, reply: FastifyReply) {
    const meta = requestMeta(req)
    const params = parseSchema(idParamSchema, req.params)
    const data = await ReportService.consignmentSummary(meta.tenantId, params.id)
    reply.send({ success: true, data })
  },

  async supplierSettlement(req: FastifyRequest, reply: FastifyReply) {
    const meta = requestMeta(req)
    const params = parseSchema(idParamSchema, req.params)
    const data = await ReportService.supplierSettlement(meta.tenantId, params.id)
    reply.send({ success: true, data })
  },
}
