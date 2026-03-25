import { FastifyPlugin } from "@/core/server/plugins"
import { authenticate } from "@/core/server/middleware/authenticate"
import { CustomerController } from "./customerController"

export const CustomerRouter: FastifyPlugin = (app, _opts, next) => {
  app.get("/", { preHandler: [authenticate] }, CustomerController.list)
  app.get("/:id", { preHandler: [authenticate] }, CustomerController.getById)
  app.post("/", { preHandler: [authenticate] }, CustomerController.create)
  app.put("/:id", { preHandler: [authenticate] }, CustomerController.update)
  app.delete("/:id", { preHandler: [authenticate] }, CustomerController.remove)
  next()
}
