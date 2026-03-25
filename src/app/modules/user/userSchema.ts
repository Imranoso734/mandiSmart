import { UserRole } from "@prisma/client"
import { z } from "zod"
import { paginationSchema } from "../shared/schema"

export const listUsersQuerySchema = paginationSchema.extend({
  role: z.nativeEnum(UserRole).optional(),
})

export const createUserSchema = z.object({
  name: z.string().trim().min(2),
  email: z.string().email(),
  phone: z.string().trim().optional(),
  role: z.nativeEnum(UserRole).default(UserRole.OPERATOR),
  password: z.string().min(8),
})

export const updateUserSchema = z.object({
  name: z.string().trim().min(2).optional(),
  phone: z.string().trim().optional(),
  role: z.nativeEnum(UserRole).optional(),
  password: z.string().min(8).optional(),
  isActive: z.boolean().optional(),
})
