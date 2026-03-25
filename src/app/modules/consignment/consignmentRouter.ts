import { FastifyPlugin } from "@/core/server/plugins"
import { authenticate } from "@/core/server/middleware/authenticate"
import { ConsignmentController } from "./consignmentController"

export const ConsignmentRouter: FastifyPlugin = (app, _opts, next) => {
  app.get("/", { preHandler: [authenticate] }, ConsignmentController.list)
  app.get("/:id", { preHandler: [authenticate] }, ConsignmentController.getById)
  app.post("/", { preHandler: [authenticate] }, ConsignmentController.create)
  app.put("/:id", { preHandler: [authenticate] }, ConsignmentController.update)
  app.delete("/:id", { preHandler: [authenticate] }, ConsignmentController.remove)
  app.post("/:id/close", { preHandler: [authenticate] }, ConsignmentController.close)
  next()
}
