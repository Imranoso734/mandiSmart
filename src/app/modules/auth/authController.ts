import { FastifyReply, FastifyRequest } from "fastify"
import { parseSchema } from "../shared/schema"
import { loginSchema, registerOwnerSchema } from "./authSchema"
import { AuthService } from "./authService"
import { requestMeta } from "@/core/helpers/requestMeta"

export const AuthController = {
  async register(req: FastifyRequest, reply: FastifyReply) {
    const payload = parseSchema(registerOwnerSchema, req.body)
    const data = await AuthService.registerOwner(payload)
    reply.status(201).send({ success: true, data })
  },

  async login(req: FastifyRequest, reply: FastifyReply) {
    const payload = parseSchema(loginSchema, req.body)
    const data = await AuthService.login(payload)
    reply.send({ success: true, data })
  },

  async me(req: FastifyRequest, reply: FastifyReply) {
    const meta = requestMeta(req)
    const data = await AuthService.me(meta.userId)
    reply.send({ success: true, data })
  },
}
