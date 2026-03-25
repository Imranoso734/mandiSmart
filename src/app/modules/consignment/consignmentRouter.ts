import { FastifyPlugin } from "@/core/server/plugins"
import { authenticate } from "@/core/server/middleware/authenticate"
import { IdParamsSchema } from "../shared/schema"
import { ConsignmentController } from "./consignmentController"
import {
  CloseConsignmentSchema,
  CreateConsignmentSchema,
  ListConsignmentQuerySchema,
  UpdateConsignmentSchema,
} from "./consignmentSchema"

export const ConsignmentRouter: FastifyPlugin = (app, _opts, next) => {
  app.get("/", { preHandler: [authenticate], schema: { querystring: ListConsignmentQuerySchema } }, ConsignmentController.list)
  app.get("/:id", { preHandler: [authenticate], schema: { params: IdParamsSchema } }, ConsignmentController.getById)
  app.post("/", { preHandler: [authenticate], schema: { body: CreateConsignmentSchema } }, ConsignmentController.create)
  app.put("/:id", { preHandler: [authenticate], schema: { params: IdParamsSchema, body: UpdateConsignmentSchema } }, ConsignmentController.update)
  app.delete("/:id", { preHandler: [authenticate], schema: { params: IdParamsSchema } }, ConsignmentController.remove)
  app.post("/:id/close", { preHandler: [authenticate], schema: { params: IdParamsSchema, body: CloseConsignmentSchema } }, ConsignmentController.close)
  next()
}
