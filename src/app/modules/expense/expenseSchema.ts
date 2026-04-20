import { FromSchema } from "json-schema-to-ts"
import { PaginationQuerySchema } from "../shared/schema"

const ExpenseTypeEnum = ["LABOUR", "VEHICLE_RENT", "OTHER"] as const

export const ListExpenseQuerySchema = {
  type: "object",
  properties: {
    ...PaginationQuerySchema.properties,
    consignmentId: { type: "number" },
    expenseType: { type: "string", enum: ExpenseTypeEnum },
  },
  additionalProperties: false,
} as const
export type ListExpenseQuery = FromSchema<typeof ListExpenseQuerySchema>

export const CreateExpenseSchema = {
  type: "object",
  properties: {
    consignmentId: { type: "number" },
    expenseType: { type: "string", enum: ExpenseTypeEnum },
    titleUrdu: { type: "string", minLength: 1 },
    amount: { type: "number", exclusiveMinimum: 0 },
    expenseDate: { type: "string", format: "date-time" },
    notes: { type: "string" },
  },
  required: ["expenseType", "titleUrdu", "amount", "expenseDate"],
  additionalProperties: false,
} as const
export type CreateExpense = FromSchema<typeof CreateExpenseSchema>

export const UpdateExpenseSchema = {
  type: "object",
  properties: CreateExpenseSchema.properties,
  additionalProperties: false,
} as const
export type UpdateExpense = FromSchema<typeof UpdateExpenseSchema>
