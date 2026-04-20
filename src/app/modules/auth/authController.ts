import { FastifyReply, FastifyRequest } from "fastify"
import { requestMeta } from "@/core/helpers/requestMeta"
import { AuthService } from "./authService"
import { GenerateQrBody, LoginBody, QrLoginBody, RegisterOwner } from "./authSchema"

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

  async generateQr(req: FastifyRequest, reply: FastifyReply) {
    const meta = requestMeta(req)
    const { userId } = req.body as GenerateQrBody
    const data = await AuthService.generateMunshiQr(meta.tenantId, userId)
    reply.send({ success: true, data })
  },

  async loginWithQr(req: FastifyRequest, reply: FastifyReply) {
    const { token } = req.body as QrLoginBody
    const data = await AuthService.loginWithQr(token)
    reply.send({ success: true, data })
  },
}
