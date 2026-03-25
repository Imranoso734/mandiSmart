import { FastifyRequest } from "fastify"
import { AuthException } from "@/core/entities/exceptions"
import { JWT } from "@/core/helpers/jwt"
import { authConfig } from "@/app/config"
import { db } from "@/core/database"

type AuthClaims = {
  scope: string
  userId: number
  tenantId: number
  userRole: string
}

/**
 * Yahan bearer token verify karke tenant-aware context set karte hain.
 */
export async function authenticate(req: FastifyRequest): Promise<void> {
  const token = parseBearerToken(req)
  if (!token) {
    throw AuthException("authorization token required hai")
  }

  const claims = await JWT.validate<AuthClaims>(authConfig.jwt.secret, token)
  if (!claims || claims.scope !== authConfig.tokens.auth.scope) {
    throw AuthException("invalid auth token")
  }

  const user = await db.user.findUnique({
    where: { id: claims.userId },
    include: { tenant: true },
  })

  if (!user || !user.isActive || !user.tenant.isActive || user.tenantId !== claims.tenantId) {
    throw AuthException("token expire ya inactive hai")
  }

  req.requestContext.set("userId" as never, user.id as never)
  req.requestContext.set("tenantId" as never, user.tenantId as never)
  req.requestContext.set("userRole" as never, user.role as never)
}

function parseBearerToken(req: FastifyRequest): string | undefined {
  const header = req.headers.authorization
  if (!header?.startsWith("Bearer ")) return undefined
  return header.slice("Bearer ".length)
}
