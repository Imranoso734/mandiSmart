import { UserRole } from "@prisma/client"
import { FastifyPlugin } from "@/core/server/plugins"
import { authenticate } from "@/core/server/middleware/authenticate"
import { authorize } from "@/core/server/middleware/authorize"
import { IdParamsSchema } from "../shared/schema"
import { UserController } from "./userController"
import { CreateUserSchema, ListUsersQuerySchema, UpdateUserSchema } from "./userSchema"

export const UserRouter: FastifyPlugin = (app, _opts, next) => {
  app.get("/", { preHandler: [authenticate, authorize(UserRole.OWNER)], schema: { querystring: ListUsersQuerySchema } }, UserController.list)
  app.get("/:id", { preHandler: [authenticate, authorize(UserRole.OWNER)], schema: { params: IdParamsSchema } }, UserController.getById)
  app.post("/", { preHandler: [authenticate, authorize(UserRole.OWNER)], schema: { body: CreateUserSchema } }, UserController.create)
  app.put("/:id", { preHandler: [authenticate, authorize(UserRole.OWNER)], schema: { params: IdParamsSchema, body: UpdateUserSchema } }, UserController.update)
  app.delete("/:id", { preHandler: [authenticate, authorize(UserRole.OWNER)], schema: { params: IdParamsSchema } }, UserController.remove)
  next()
}
