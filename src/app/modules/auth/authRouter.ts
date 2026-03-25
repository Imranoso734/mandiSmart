import { FastifyPlugin } from "@/core/server/plugins"
import { authenticate } from "@/core/server/middleware/authenticate"
import { AuthController } from "./authController"
import { LoginSchema, RegisterOwnerSchema } from "./authSchema"

export const AuthRouter: FastifyPlugin = (app, _opts, next) => {
  app.post("/register-owner", { schema: { body: RegisterOwnerSchema } }, AuthController.register)
  app.post("/login", { schema: { body: LoginSchema } }, AuthController.login)
  app.get("/me", { preHandler: [authenticate] }, AuthController.me)
  next()
}
