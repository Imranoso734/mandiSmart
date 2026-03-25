import { UserRole } from "@prisma/client"
import { FastifyPlugin } from "@/core/server/plugins"
import { authenticate } from "@/core/server/middleware/authenticate"
import { authorize } from "@/core/server/middleware/authorize"
import { UserController } from "./userController"

export const UserRouter: FastifyPlugin = (app, _opts, next) => {
  app.get("/", { preHandler: [authenticate, authorize(UserRole.OWNER)] }, UserController.list)
  app.get("/:id", { preHandler: [authenticate, authorize(UserRole.OWNER)] }, UserController.getById)
  app.post("/", { preHandler: [authenticate, authorize(UserRole.OWNER)] }, UserController.create)
  app.put("/:id", { preHandler: [authenticate, authorize(UserRole.OWNER)] }, UserController.update)
  app.delete("/:id", { preHandler: [authenticate, authorize(UserRole.OWNER)] }, UserController.remove)
  next()
}
