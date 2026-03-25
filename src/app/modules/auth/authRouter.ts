import { FastifyPlugin } from "@/core/server/plugins"
import { authenticate } from "@/core/server/middleware/authenticate"
import { AuthController } from "./authController"

export const AuthRouter: FastifyPlugin = (app, _opts, next) => {
  app.post("/register-owner", AuthController.register)
  app.post("/login", AuthController.login)
  app.get("/me", { preHandler: [authenticate] }, AuthController.me)
  next()
}
