import { FastifyPlugin } from "@/core/server/plugins"
import { authenticate } from "@/core/server/middleware/authenticate"
import { IdParamsSchema } from "../shared/schema"
import { ReportController } from "./reportController"
import { DailyReportQuerySchema, LedgerQuerySchema } from "./reportSchema"

export const ReportRouter: FastifyPlugin = (app, _opts, next) => {
  app.get("/daily-sales", { preHandler: [authenticate], schema: { querystring: DailyReportQuerySchema } }, ReportController.dailySales)
  app.get("/customer-ledger/:id", { preHandler: [authenticate], schema: { params: IdParamsSchema, querystring: LedgerQuerySchema } }, ReportController.customerLedger)
  app.get("/consignment-summary/:id", { preHandler: [authenticate], schema: { params: IdParamsSchema } }, ReportController.consignmentSummary)
  app.get("/supplier-settlement/:id", { preHandler: [authenticate], schema: { params: IdParamsSchema } }, ReportController.supplierSettlement)
  next()
}
