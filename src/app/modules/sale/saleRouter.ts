import { FastifyPlugin } from "@/core/server/plugins"
import { authenticate } from "@/core/server/middleware/authenticate"
import { IdParamsSchema } from "../shared/schema"
import { SaleController } from "./saleController"
import { CreateSaleSchema, ListSaleQuerySchema, UpdateSaleSchema } from "./saleSchema"

export const SaleRouter: FastifyPlugin = (app, _opts, next) => {
  app.get("/", { preHandler: [authenticate], schema: { querystring: ListSaleQuerySchema } }, SaleController.list)
  app.get("/:id", { preHandler: [authenticate], schema: { params: IdParamsSchema } }, SaleController.getById)
  app.post("/", { preHandler: [authenticate], schema: { body: CreateSaleSchema } }, SaleController.create)
  app.put("/:id", { preHandler: [authenticate], schema: { params: IdParamsSchema, body: UpdateSaleSchema } }, SaleController.update)
  app.delete("/:id", { preHandler: [authenticate], schema: { params: IdParamsSchema } }, SaleController.remove)
  next()
}
