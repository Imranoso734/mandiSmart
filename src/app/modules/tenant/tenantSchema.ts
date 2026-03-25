import { FromSchema } from "json-schema-to-ts"

export const UpdateTenantSchema = {
  type: "object",
  properties: {
    name: { type: "string", minLength: 2 },
    phone: { type: "string" },
    address: { type: "string" },
    locale: { type: "string" },
    currency: { type: "string" },
    isActive: { type: "boolean" },
  },
  additionalProperties: false,
} as const
export type UpdateTenant = FromSchema<typeof UpdateTenantSchema>
