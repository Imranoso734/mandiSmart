import { FastifyPlugin } from "@/core/server/plugins"
import { authenticate } from "@/core/server/middleware/authenticate"
import { IdParamsSchema } from "../shared/schema"
import { CustomerController } from "./customerController"
import { CreateCustomerSchema, ListCustomerQuerySchema, UpdateCustomerSchema } from "./customerSchema"

export const CustomerRouter: FastifyPlugin = (app, _opts, next) => {
  app.get("/", { preHandler: [authenticate], schema: { querystring: ListCustomerQuerySchema } }, CustomerController.list)
  app.get("/:id", { preHandler: [authenticate], schema: { params: IdParamsSchema } }, CustomerController.getById)
  app.post("/", { preHandler: [authenticate], schema: { body: CreateCustomerSchema } }, CustomerController.create)
  app.put("/:id", { preHandler: [authenticate], schema: { params: IdParamsSchema, body: UpdateCustomerSchema } }, CustomerController.update)
  app.delete("/:id", { preHandler: [authenticate], schema: { params: IdParamsSchema } }, CustomerController.remove)
  next()
}
