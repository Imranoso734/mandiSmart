import { FromSchema } from "json-schema-to-ts"
import { OPTIONAL_PHONE_INPUT_PATTERN } from "../shared/phone"

export const RegisterOwnerSchema = {
  type: "object",
  properties: {
    tenantName: { type: "string", minLength: 2 },
    tenantSlug: { type: "string", minLength: 2 },
    tenantPhone: { type: "string", pattern: OPTIONAL_PHONE_INPUT_PATTERN },
    tenantAddress: { type: "string" },
    ownerName: { type: "string", minLength: 2 },
    ownerEmail: { type: "string", format: "email" },
    ownerPhone: { type: "string", pattern: OPTIONAL_PHONE_INPUT_PATTERN },
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

export const GenerateQrSchema = {
  type: "object",
  properties: {
    userId: { type: "integer", minimum: 1 },
  },
  required: ["userId"],
  additionalProperties: false,
} as const
export type GenerateQrBody = FromSchema<typeof GenerateQrSchema>

export const QrLoginSchema = {
  type: "object",
  properties: {
    token: { type: "string", minLength: 10 },
  },
  required: ["token"],
  additionalProperties: false,
} as const
export type QrLoginBody = FromSchema<typeof QrLoginSchema>
