import { FastifyPlugin } from "@/core/server/plugins"
import { authenticate } from "@/core/server/middleware/authenticate"
import { ReportController } from "./reportController"

export const ReportRouter: FastifyPlugin = (app, _opts, next) => {
  app.get("/daily-sales", { preHandler: [authenticate] }, ReportController.dailySales)
  app.get("/customer-ledger/:id", { preHandler: [authenticate] }, ReportController.customerLedger)
  app.get("/consignment-summary/:id", { preHandler: [authenticate] }, ReportController.consignmentSummary)
  app.get("/supplier-settlement/:id", { preHandler: [authenticate] }, ReportController.supplierSettlement)
  next()
}
