import { UserRole } from "@prisma/client"
import { FastifyPlugin } from "@/core/server/plugins"
import { authenticate } from "@/core/server/middleware/authenticate"
import { authorize } from "@/core/server/middleware/authorize"
import { TenantController } from "./tenantController"

export const TenantRouter: FastifyPlugin = (app, _opts, next) => {
  app.get("/me", { preHandler: [authenticate] }, TenantController.getCurrent)
  app.patch(
    "/me",
    { preHandler: [authenticate, authorize(UserRole.OWNER)] },
    TenantController.updateCurrent,
  )
  next()
}
