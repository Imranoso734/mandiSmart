import { z } from "zod"
import { paginationSchema } from "../shared/schema"

const saleItemSchema = z.object({
  consignmentId: z.coerce.number().int().positive(),
  consignmentItemId: z.coerce.number().int().positive(),
  productNameUrdu: z.string().trim().min(1),
  quantity: z.coerce.number().positive(),
  rate: z.coerce.number().positive(),
})

export const listSaleQuerySchema = paginationSchema.extend({
  customerId: z.coerce.number().int().positive().optional(),
})

export const createSaleSchema = z.object({
  customerId: z.coerce.number().int().positive(),
  saleDate: z.coerce.date(),
  notes: z.string().trim().optional(),
  items: z.array(saleItemSchema).min(1),
})

export const updateSaleSchema = createSaleSchema.partial()
