import { UserRole } from "@prisma/client"
import { FastifyPlugin } from "@/core/server/plugins"
import { authenticate } from "@/core/server/middleware/authenticate"
import { authorize } from "@/core/server/middleware/authorize"
import { AuthController } from "./authController"
import { GenerateQrSchema, LoginSchema, QrLoginSchema, RegisterOwnerSchema } from "./authSchema"

export const AuthRouter: FastifyPlugin = (app, _opts, next) => {
  app.post("/register-owner", { schema: { body: RegisterOwnerSchema } }, AuthController.register)
  app.post("/login", { schema: { body: LoginSchema } }, AuthController.login)
  app.get("/me", { preHandler: [authenticate] }, AuthController.me)

  // QR-based munshi login (public — mobile app uses this)
  app.post("/qr/login", { schema: { body: QrLoginSchema } }, AuthController.loginWithQr)

  // QR token generation — OWNER only
  app.post(
    "/qr/generate",
    { preHandler: [authenticate, authorize(UserRole.OWNER)], schema: { body: GenerateQrSchema } },
    AuthController.generateQr,
  )

  next()
}
