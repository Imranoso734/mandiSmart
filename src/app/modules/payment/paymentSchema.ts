import { PaymentMethod } from "@prisma/client"
import { z } from "zod"
import { paginationSchema } from "../shared/schema"

export const listPaymentQuerySchema = paginationSchema.extend({
  customerId: z.coerce.number().int().positive().optional(),
  method: z.nativeEnum(PaymentMethod).optional(),
})

export const createPaymentSchema = z.object({
  customerId: z.coerce.number().int().positive(),
  amount: z.coerce.number().positive(),
  paymentDate: z.coerce.date(),
  method: z.nativeEnum(PaymentMethod).default(PaymentMethod.CASH),
  reference: z.string().trim().optional(),
  notes: z.string().trim().optional(),
})

export const updatePaymentSchema = createPaymentSchema.partial()
