import { FromSchema } from "json-schema-to-ts"
import { PaginationQuerySchema } from "../shared/schema"

export const ListCustomerQuerySchema = {
  type: "object",
  properties: {
    ...PaginationQuerySchema.properties,
    isActive: { type: "boolean" },
  },
  additionalProperties: false,
} as const
export type ListCustomerQuery = FromSchema<typeof ListCustomerQuerySchema>

export const CreateCustomerSchema = {
  type: "object",
  properties: {
    name: { type: "string", minLength: 2 },
    phone: { type: "string" },
    address: { type: "string" },
    notes: { type: "string" },
    isActive: { type: "boolean", default: true },
  },
  required: ["name"],
  additionalProperties: false,
} as const
export type CreateCustomer = FromSchema<typeof CreateCustomerSchema>

export const UpdateCustomerSchema = {
  type: "object",
  properties: CreateCustomerSchema.properties,
  additionalProperties: false,
} as const
export type UpdateCustomer = FromSchema<typeof UpdateCustomerSchema>
