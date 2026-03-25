import { FromSchema } from "json-schema-to-ts"
import { PaginationQuerySchema } from "../shared/schema"

const UserRoleEnum = ["OWNER", "OPERATOR"] as const

export const ListUsersQuerySchema = {
  type: "object",
  properties: {
    ...PaginationQuerySchema.properties,
    role: { type: "string", enum: UserRoleEnum },
  },
  additionalProperties: false,
} as const
export type ListUsersQuery = FromSchema<typeof ListUsersQuerySchema>

export const CreateUserSchema = {
  type: "object",
  properties: {
    name: { type: "string", minLength: 2 },
    email: { type: "string", format: "email" },
    phone: { type: "string" },
    role: { type: "string", enum: UserRoleEnum, default: "OPERATOR" },
    password: { type: "string", minLength: 8 },
  },
  required: ["name", "email", "password"],
  additionalProperties: false,
} as const
export type CreateUser = FromSchema<typeof CreateUserSchema>

export const UpdateUserSchema = {
  type: "object",
  properties: {
    name: { type: "string", minLength: 2 },
    phone: { type: "string" },
    role: { type: "string", enum: UserRoleEnum },
    password: { type: "string", minLength: 8 },
    isActive: { type: "boolean" },
  },
  additionalProperties: false,
} as const
export type UpdateUser = FromSchema<typeof UpdateUserSchema>
