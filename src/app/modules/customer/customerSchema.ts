import { z } from "zod"
import { paginationSchema } from "../shared/schema"

export const listCustomerQuerySchema = paginationSchema.extend({
  isActive: z.coerce.boolean().optional(),
})

export const createCustomerSchema = z.object({
  name: z.string().trim().min(2),
  phone: z.string().trim().optional(),
  address: z.string().trim().optional(),
  notes: z.string().trim().optional(),
  isActive: z.boolean().optional().default(true),
})

export const updateCustomerSchema = createCustomerSchema.partial()
