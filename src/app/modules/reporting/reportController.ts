import { FastifyReply, FastifyRequest } from "fastify"
import { requestMeta } from "@/core/helpers/requestMeta"
import { IdParams } from "../shared/schema"
import { toDateOnly } from "../shared/utils"
import { DailyReportQuery, DashboardOverviewQuery, LedgerQuery } from "./reportSchema"
import { ReportService } from "./reportService"

export const ReportController = {
  async dashboardOverview(req: FastifyRequest, reply: FastifyReply) {
    const meta = requestMeta(req)
    const query = req.query as DashboardOverviewQuery
    const data = await ReportService.dashboardOverview(meta.tenantId, toDateOnly(query.date) as Date)
    reply.send({ success: true, data })
  },

  async dailySales(req: FastifyRequest, reply: FastifyReply) {
    const meta = requestMeta(req)
    const query = req.query as DailyReportQuery
    const data = await ReportService.dailySales(meta.tenantId, toDateOnly(query.date) as Date)
    reply.send({ success: true, data })
  },

  async customerLedger(req: FastifyRequest, reply: FastifyReply) {
    const meta = requestMeta(req)
    const params = req.params as IdParams
    const query = req.query as LedgerQuery
    const data = await ReportService.customerLedger(
      meta.tenantId,
      params.id,
      toDateOnly(query.from),
      toDateOnly(query.to),
    )
    reply.send({ success: true, data })
  },

  async consignmentSummary(req: FastifyRequest, reply: FastifyReply) {
    const meta = requestMeta(req)
    const params = req.params as IdParams
    const data = await ReportService.consignmentSummary(meta.tenantId, params.id)
    reply.send({ success: true, data })
  },

  async supplierSettlement(req: FastifyRequest, reply: FastifyReply) {
    const meta = requestMeta(req)
    const params = req.params as IdParams
    const data = await ReportService.supplierSettlement(meta.tenantId, params.id)
    reply.send({ success: true, data })
  },
}
