import { FastifyPlugin } from "@/core/server/plugins"
import { authenticate } from "@/core/server/middleware/authenticate"
import { SupplierController } from "./supplierController"

export const SupplierRouter: FastifyPlugin = (app, _opts, next) => {
  app.get("/", { preHandler: [authenticate] }, SupplierController.list)
  app.get("/:id", { preHandler: [authenticate] }, SupplierController.getById)
  app.post("/", { preHandler: [authenticate] }, SupplierController.create)
  app.put("/:id", { preHandler: [authenticate] }, SupplierController.update)
  app.delete("/:id", { preHandler: [authenticate] }, SupplierController.remove)
  next()
}
