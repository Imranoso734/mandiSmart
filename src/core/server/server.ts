import fastify, { FastifyInstance } from "fastify"
import cors from "@fastify/cors"
import helmet from "@fastify/helmet"
import multipart from "@fastify/multipart"
import rateLimit from "@fastify/rate-limit"
import { fastifyRequestContextPlugin } from "@fastify/request-context"
import {
  FastifyPlugin,
  rateLimitPluginOptions,
  requestContextPluginOptions,
  routesPlugin,
} from "./plugins"
import { serverConfig } from "@/app/config"

export const Server = {
  new(): FastifyInstance {
    const app = fastify({ logger: true })

    app
      .register(cors, {
        origin: true,
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization"],
        credentials: true,
      })
      .register(helmet, { global: true })
      .register(rateLimit, rateLimitPluginOptions)
      .register(fastifyRequestContextPlugin, requestContextPluginOptions)
      .register(multipart)
      .register(routesPlugin.plug())

    app.setErrorHandler((error, _request, reply) => {
      const appError = error as { statusCode?: number; message?: string }
      const statusCode = appError.statusCode || 500
      reply.status(statusCode).send({
        success: false,
        message: appError.message || "internal server error",
      })
    })

    return app
  },

  start(app: FastifyInstance): Promise<void> {
    return new Promise((resolve, reject) => {
      app.listen(serverConfig, (error) => {
        if (error) {
          reject(error)
          return
        }

        resolve()
      })
    })
  },

  newTestServer(router: FastifyPlugin): FastifyInstance {
    const instance = fastify({ logger: false })
    instance.register(fastifyRequestContextPlugin, requestContextPluginOptions)
    instance.register(router)
    return instance
  },
}
