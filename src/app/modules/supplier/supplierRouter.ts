import { FastifyPlugin } from "@/core/server/plugins"
import { authenticate } from "@/core/server/middleware/authenticate"
import { IdParamsSchema } from "../shared/schema"
import { SupplierController } from "./supplierController"
import { CreateSupplierSchema, ListSupplierQuerySchema, UpdateSupplierSchema } from "./supplierSchema"

export const SupplierRouter: FastifyPlugin = (app, _opts, next) => {
  app.get("/", { preHandler: [authenticate], schema: { querystring: ListSupplierQuerySchema } }, SupplierController.list)
  app.get("/:id", { preHandler: [authenticate], schema: { params: IdParamsSchema } }, SupplierController.getById)
  app.post("/", { preHandler: [authenticate], schema: { body: CreateSupplierSchema } }, SupplierController.create)
  app.put("/:id", { preHandler: [authenticate], schema: { params: IdParamsSchema, body: UpdateSupplierSchema } }, SupplierController.update)
  app.delete("/:id", { preHandler: [authenticate], schema: { params: IdParamsSchema } }, SupplierController.remove)
  next()
}
