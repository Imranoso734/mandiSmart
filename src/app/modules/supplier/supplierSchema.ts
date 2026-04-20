import { FromSchema } from "json-schema-to-ts"
import { PaginationQuerySchema } from "../shared/schema"
import { OPTIONAL_PHONE_INPUT_PATTERN } from "../shared/phone"

export const ListSupplierQuerySchema = {
  type: "object",
  properties: {
    ...PaginationQuerySchema.properties,
    isActive: { type: "boolean" },
  },
  additionalProperties: false,
} as const
export type ListSupplierQuery = FromSchema<typeof ListSupplierQuerySchema>

export const CreateSupplierSchema = {
  type: "object",
  properties: {
    name: { type: "string", minLength: 2 },
    phone: { type: "string", pattern: OPTIONAL_PHONE_INPUT_PATTERN },
    address: { type: "string" },
    notes: { type: "string" },
    isActive: { type: "boolean", default: true },
  },
  required: ["name"],
  additionalProperties: false,
} as const
export type CreateSupplier = FromSchema<typeof CreateSupplierSchema>

export const UpdateSupplierSchema = {
  type: "object",
  properties: CreateSupplierSchema.properties,
  additionalProperties: false,
} as const
export type UpdateSupplier = FromSchema<typeof UpdateSupplierSchema>
