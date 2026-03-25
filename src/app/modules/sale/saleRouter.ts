import { FastifyPlugin } from "@/core/server/plugins"
import { authenticate } from "@/core/server/middleware/authenticate"
import { SaleController } from "./saleController"

export const SaleRouter: FastifyPlugin = (app, _opts, next) => {
  app.get("/", { preHandler: [authenticate] }, SaleController.list)
  app.get("/:id", { preHandler: [authenticate] }, SaleController.getById)
  app.post("/", { preHandler: [authenticate] }, SaleController.create)
  app.put("/:id", { preHandler: [authenticate] }, SaleController.update)
  app.delete("/:id", { preHandler: [authenticate] }, SaleController.remove)
  next()
}
