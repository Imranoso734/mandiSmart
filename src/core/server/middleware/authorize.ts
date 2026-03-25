import { FastifyReply, FastifyRequest } from "fastify"
import { DoneFuncWithErrOrRes } from "fastify/types/hooks"
import { UserRole } from "@prisma/client"
import { ForbiddenException } from "@/core/entities/exceptions"
import { requestMeta } from "@/core/helpers/requestMeta"

/**
 * Yahan role-based access enforce hota hai.
 */
export function authorize(...roles: UserRole[]) {
  return (
    req: FastifyRequest,
    _reply: FastifyReply,
    done: DoneFuncWithErrOrRes,
  ) => {
    const { userRole } = requestMeta(req)
    if (!roles.includes(userRole)) {
      throw ForbiddenException("is action ke liye ijazat nahin hai")
    }

    done()
  }
}
