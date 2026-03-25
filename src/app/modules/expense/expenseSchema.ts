import { ExpenseType } from "@prisma/client"
import { z } from "zod"
import { paginationSchema } from "../shared/schema"

export const listExpenseQuerySchema = paginationSchema.extend({
  consignmentId: z.coerce.number().int().positive().optional(),
  expenseType: z.nativeEnum(ExpenseType).optional(),
})

export const createExpenseSchema = z.object({
  consignmentId: z.coerce.number().int().positive().optional(),
  expenseType: z.nativeEnum(ExpenseType),
  titleUrdu: z.string().trim().min(1),
  amount: z.coerce.number().positive(),
  expenseDate: z.coerce.date(),
  notes: z.string().trim().optional(),
})

export const updateExpenseSchema = createExpenseSchema.partial()
