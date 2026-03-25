import { FastifyPlugin } from "@/core/server/plugins"
import { authenticate } from "@/core/server/middleware/authenticate"
import { IdParamsSchema } from "../shared/schema"
import { PaymentController } from "./paymentController"
import { CreatePaymentSchema, ListPaymentQuerySchema, UpdatePaymentSchema } from "./paymentSchema"

export const PaymentRouter: FastifyPlugin = (app, _opts, next) => {
  app.get("/", { preHandler: [authenticate], schema: { querystring: ListPaymentQuerySchema } }, PaymentController.list)
  app.get("/:id", { preHandler: [authenticate], schema: { params: IdParamsSchema } }, PaymentController.getById)
  app.post("/", { preHandler: [authenticate], schema: { body: CreatePaymentSchema } }, PaymentController.create)
  app.put("/:id", { preHandler: [authenticate], schema: { params: IdParamsSchema, body: UpdatePaymentSchema } }, PaymentController.update)
  app.delete("/:id", { preHandler: [authenticate], schema: { params: IdParamsSchema } }, PaymentController.remove)
  next()
}
