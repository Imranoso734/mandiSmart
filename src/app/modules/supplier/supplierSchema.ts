import { z } from "zod"
import { paginationSchema } from "../shared/schema"

export const listSupplierQuerySchema = paginationSchema.extend({
  isActive: z.coerce.boolean().optional(),
})

export const createSupplierSchema = z.object({
  name: z.string().trim().min(2),
  phone: z.string().trim().optional(),
  address: z.string().trim().optional(),
  notes: z.string().trim().optional(),
  isActive: z.boolean().optional().default(true),
})

export const updateSupplierSchema = createSupplierSchema.partial()
