import { FromSchema } from "json-schema-to-ts"

export const IdParamsSchema = {
  type: "object",
  properties: {
    id: { type: "number" },
  },
  required: ["id"],
  additionalProperties: false,
} as const
export type IdParams = FromSchema<typeof IdParamsSchema>

export const PaginationQuerySchema = {
  type: "object",
  properties: {
    page: { type: "number", minimum: 1, default: 1 },
    limit: { type: "number", minimum: 1, maximum: 100, default: 20 },
    search: { type: "string" },
  },
  additionalProperties: false,
} as const
export type PaginationQuery = FromSchema<typeof PaginationQuerySchema>
