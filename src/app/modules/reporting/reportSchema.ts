import { FromSchema } from "json-schema-to-ts"

export const DailyReportQuerySchema = {
  type: "object",
  properties: {
    date: { type: "string", format: "date" },
  },
  required: ["date"],
  additionalProperties: false,
} as const
export type DailyReportQuery = FromSchema<typeof DailyReportQuerySchema>

export const DashboardOverviewQuerySchema = DailyReportQuerySchema
export type DashboardOverviewQuery = FromSchema<typeof DashboardOverviewQuerySchema>

export const LedgerQuerySchema = {
  type: "object",
  properties: {
    from: { type: "string", format: "date" },
    to: { type: "string", format: "date" },
  },
  additionalProperties: false,
} as const
export type LedgerQuery = FromSchema<typeof LedgerQuerySchema>
