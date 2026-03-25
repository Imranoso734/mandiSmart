import { FastifyPlugin } from "@/core/server/plugins"
import { authenticate } from "@/core/server/middleware/authenticate"
import { PaymentController } from "./paymentController"

export const PaymentRouter: FastifyPlugin = (app, _opts, next) => {
  app.get("/", { preHandler: [authenticate] }, PaymentController.list)
  app.get("/:id", { preHandler: [authenticate] }, PaymentController.getById)
  app.post("/", { preHandler: [authenticate] }, PaymentController.create)
  app.put("/:id", { preHandler: [authenticate] }, PaymentController.update)
  app.delete("/:id", { preHandler: [authenticate] }, PaymentController.remove)
  next()
}
