import { db } from "@/core/database"

export const HealthCheckService = {
  /**
   * Yahan se app aur database dono ki basic health milti hai.
   */
  async status() {
    await db.$queryRaw`SELECT 1`

    return {
      app: "MandiSmart",
      status: "ok",
      timestamp: new Date().toISOString(),
      database: "connected",
    }
  },
}
