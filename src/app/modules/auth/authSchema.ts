import { FromSchema } from "json-schema-to-ts"

export const RegisterOwnerSchema = {
  type: "object",
  properties: {
    tenantName: { type: "string", minLength: 2 },
    tenantSlug: { type: "string", minLength: 2 },
    tenantPhone: { type: "string" },
    tenantAddress: { type: "string" },
    ownerName: { type: "string", minLength: 2 },
    ownerEmail: { type: "string", format: "email" },
    ownerPhone: { type: "string" },
    password: { type: "string", minLength: 8 },
  },
  required: ["tenantName", "ownerName", "ownerEmail", "password"],
  additionalProperties: false,
} as const
export type RegisterOwner = FromSchema<typeof RegisterOwnerSchema>

export const LoginSchema = {
  type: "object",
  properties: {
    tenantSlug: { type: "string", minLength: 2 },
    email: { type: "string", format: "email" },
    password: { type: "string", minLength: 1 },
  },
  required: ["tenantSlug", "email", "password"],
  additionalProperties: false,
} as const
export type LoginBody = FromSchema<typeof LoginSchema>
