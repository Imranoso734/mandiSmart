import { env } from "@/core/helpers/env"

export const appConfig = {
  name: env("APP_NAME"),
  publicBaseUrl: env("PUBLIC_BASE_URL"),
  timezone: env("APP_TIMEZONE"),
  tenantLocale: "ur-PK",
  tenantCurrency: "PKR",
}
