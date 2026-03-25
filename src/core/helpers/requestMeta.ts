import { FastifyRequest } from "fastify"
import { UserRole } from "@prisma/client"
import { logger } from "@/core/server/logger"

/**
 * Yahan se verified request ka auth context nikalte hain.
 */
export function requestMeta(req: FastifyRequest): {
  userId: number
  tenantId: number
  userRole: UserRole
} {
  const userId = req.requestContext.get("userId" as never) as number | undefined
  const tenantId = req.requestContext.get("tenantId" as never) as number | undefined
  const userRole = req.requestContext.get("userRole" as never) as UserRole | undefined

  if (!userId || !tenantId || !userRole) {
    logger.error("verified request context missing")
    throw new Error("request auth context missing")
  }

  return { userId, tenantId, userRole }
}
