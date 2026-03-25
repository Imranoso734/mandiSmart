import { z } from "zod"

export const updateTenantSchema = z.object({
  name: z.string().trim().min(2).optional(),
  phone: z.string().trim().optional(),
  address: z.string().trim().optional(),
  locale: z.string().trim().optional(),
  currency: z.string().trim().optional(),
  isActive: z.boolean().optional(),
})
