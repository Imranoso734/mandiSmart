import { FromSchema } from "json-schema-to-ts"
import { PaginationQuerySchema } from "../shared/schema"

const SaleItemSchema = {
  type: "object",
  properties: {
    consignmentId: { type: "number" },
    consignmentItemId: { type: "number" },
    productNameUrdu: { type: "string", minLength: 1 },
    quantity: { type: "number", exclusiveMinimum: 0 },
    rate: { type: "number", exclusiveMinimum: 0 },
  },
  required: ["consignmentId", "consignmentItemId", "productNameUrdu", "quantity", "rate"],
  additionalProperties: false,
} as const
export type SaleItemBody = FromSchema<typeof SaleItemSchema>

export const ListSaleQuerySchema = {
  type: "object",
  properties: {
    ...PaginationQuerySchema.properties,
    customerId: { type: "number" },
  },
  additionalProperties: false,
} as const
export type ListSaleQuery = FromSchema<typeof ListSaleQuerySchema>

export const CreateSaleSchema = {
  type: "object",
  properties: {
    customerId: { type: "number" },
    saleDate: { type: "string", format: "date-time" },
    notes: { type: "string" },
    items: {
      type: "array",
      minItems: 1,
      items: SaleItemSchema,
    },
  },
  required: ["customerId", "saleDate", "items"],
  additionalProperties: false,
} as const
export type CreateSale = FromSchema<typeof CreateSaleSchema>

export const UpdateSaleSchema = {
  type: "object",
  properties: CreateSaleSchema.properties,
  additionalProperties: false,
} as const
export type UpdateSale = FromSchema<typeof UpdateSaleSchema>
