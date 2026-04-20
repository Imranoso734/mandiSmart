import { FromSchema } from "json-schema-to-ts"
import { OPTIONAL_PHONE_INPUT_PATTERN } from "../shared/phone"

export const UpdateTenantSchema = {
  type: "object",
  properties: {
    name: { type: "string", minLength: 2 },
    phone: { type: "string", pattern: OPTIONAL_PHONE_INPUT_PATTERN },
    address: { type: "string" },
    locale: { type: "string" },
    currency: { type: "string" },
    isActive: { type: "boolean" },
  },
  additionalProperties: false,
} as const
export type UpdateTenant = FromSchema<typeof UpdateTenantSchema>
