import fp from "fastify-plugin"
import multipart from "@fastify/multipart"

export default fp(async (app) => {
    await app.register(multipart, {
        limits: {
            files: 10,
            fileSize: 10 * 1024 * 1024, // 10MB
        },
    })
})
