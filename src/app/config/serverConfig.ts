export const serverConfig = {
  host: process.env.HOST || "0.0.0.0",
  port: Number(process.env.PORT || 5000),
  rateLimit: {
    max: 200,
    timeWindow: 60000,
  },
}
