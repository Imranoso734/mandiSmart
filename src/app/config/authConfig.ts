import { env } from "@/core/helpers/env"

export const authConfig = {
  password: {
    minLength: 8,
  },
  jwt: {
    secret: env("JWT_SECRET"),
  },
  tokens: {
    auth: { scope: "AUTH", expiry: 60 * 24 * 7 },
  },
  authStateDefaults: {
    userId: 0,
    tenantId: 0,
    userRole: "",
  },
}
