import { FromSchema } from "json-schema-to-ts"
import { PaginationQuerySchema } from "../shared/schema"
import { OPTIONAL_PHONE_INPUT_PATTERN } from "../shared/phone"

const ConsignmentStatusEnum = ["OPEN", "CLOSED"] as const
const CommissionTypeEnum = ["PERCENTAGE"] as const

const ConsignmentItemSchema = {
  type: "object",
  properties: {
    productNameUrdu: { type: "string", minLength: 1 },
    productNameRoman: { type: "string" },
    unit: { type: "string", minLength: 1, default: "کلو" },
    quantityReceived: { type: "number", exclusiveMinimum: 0 },
    baseRate: { type: "number", minimum: 0 },
  },
  required: ["productNameUrdu"],
  additionalProperties: false,
} as const
export type ConsignmentItem = FromSchema<typeof ConsignmentItemSchema>

export const ListConsignmentQuerySchema = {
  type: "object",
  properties: {
    ...PaginationQuerySchema.properties,
    supplierId: { type: "number" },
    status: { type: "string", enum: ConsignmentStatusEnum },
  },
  additionalProperties: false,
} as const
export type ListConsignmentQuery = FromSchema<typeof ListConsignmentQuerySchema>

export const CreateConsignmentSchema = {
  type: "object",
  properties: {
    supplierId: { type: "number" },
    vehicleNumber: { type: "string", minLength: 2 },
    driverName: { type: "string" },
    driverPhone: { type: "string", pattern: OPTIONAL_PHONE_INPUT_PATTERN },
    arrivalDate: { type: "string", format: "date-time" },
    notes: { type: "string" },
    commissionType: { type: "string", enum: CommissionTypeEnum, default: "PERCENTAGE" },
    commissionValue: { type: "number", minimum: 0 },
    items: {
      type: "array",
      minItems: 1,
      items: ConsignmentItemSchema,
    },
  },
  required: ["supplierId", "vehicleNumber", "arrivalDate", "commissionValue", "items"],
  additionalProperties: false,
} as const
export type CreateConsignment = FromSchema<typeof CreateConsignmentSchema>

export const UpdateConsignmentSchema = {
  type: "object",
  properties: CreateConsignmentSchema.properties,
  additionalProperties: false,
} as const
export type UpdateConsignment = FromSchema<typeof UpdateConsignmentSchema>

export const CloseConsignmentSchema = {
  type: "object",
  properties: {
    notes: { type: "string" },
  },
  additionalProperties: false,
} as const
export type CloseConsignment = FromSchema<typeof CloseConsignmentSchema>
