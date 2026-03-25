import { z } from "zod"

export const dailyReportQuerySchema = z.object({
  date: z.coerce.date(),
})

export const ledgerQuerySchema = z.object({
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
})
