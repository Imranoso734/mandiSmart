import { FromSchema } from "json-schema-to-ts"
import { PaginationQuerySchema } from "../shared/schema"

const PaymentMethodEnum = ["CASH", "BANK", "MOBILE_WALLET", "ADJUSTMENT"] as const

export const ListPaymentQuerySchema = {
  type: "object",
  properties: {
    ...PaginationQuerySchema.properties,
    customerId: { type: "number" },
    method: { type: "string", enum: PaymentMethodEnum },
  },
  additionalProperties: false,
} as const
export type ListPaymentQuery = FromSchema<typeof ListPaymentQuerySchema>

export const CreatePaymentSchema = {
  type: "object",
  properties: {
    customerId: { type: "number" },
    amount: { type: "number", exclusiveMinimum: 0 },
    paymentDate: { type: "string", format: "date-time" },
    method: { type: "string", enum: PaymentMethodEnum, default: "CASH" },
    reference: { type: "string" },
    notes: { type: "string" },
  },
  required: ["customerId", "amount", "paymentDate"],
  additionalProperties: false,
} as const
export type CreatePayment = FromSchema<typeof CreatePaymentSchema>

export const UpdatePaymentSchema = {
  type: "object",
  properties: CreatePaymentSchema.properties,
  additionalProperties: false,
} as const
export type UpdatePayment = FromSchema<typeof UpdatePaymentSchema>
