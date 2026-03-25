import { UserRole } from "@prisma/client"
import { FastifyPlugin } from "@/core/server/plugins"
import { authenticate } from "@/core/server/middleware/authenticate"
import { authorize } from "@/core/server/middleware/authorize"
import { TenantController } from "./tenantController"
import { UpdateTenantSchema } from "./tenantSchema"

export const TenantRouter: FastifyPlugin = (app, _opts, next) => {
  app.get("/me", { preHandler: [authenticate] }, TenantController.getCurrent)
  app.patch(
    "/me",
    { preHandler: [authenticate, authorize(UserRole.OWNER)], schema: { body: UpdateTenantSchema } },
    TenantController.updateCurrent,
  )
  next()
}
