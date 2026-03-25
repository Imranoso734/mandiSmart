import { FastifyReply, FastifyRequest } from "fastify"
import { requestMeta } from "@/core/helpers/requestMeta"
import { AuthService } from "./authService"
import { LoginBody, RegisterOwner } from "./authSchema"

export const AuthController = {
  async register(req: FastifyRequest, reply: FastifyReply) {
    const payload = req.body as RegisterOwner
    const data = await AuthService.registerOwner(payload)
    reply.status(201).send({ success: true, data })
  },

  async login(req: FastifyRequest, reply: FastifyReply) {
    const payload = req.body as LoginBody
    const data = await AuthService.login(payload)
    reply.send({ success: true, data })
  },

  async me(req: FastifyRequest, reply: FastifyReply) {
    const meta = requestMeta(req)
    const data = await AuthService.me(meta.userId)
    reply.send({ success: true, data })
  },
}
