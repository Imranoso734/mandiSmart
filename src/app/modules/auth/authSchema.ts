import { z } from "zod"

export const registerOwnerSchema = z.object({
  tenantName: z.string().trim().min(2),
  tenantSlug: z.string().trim().min(2).optional(),
  tenantPhone: z.string().trim().optional(),
  tenantAddress: z.string().trim().optional(),
  ownerName: z.string().trim().min(2),
  ownerEmail: z.string().email(),
  ownerPhone: z.string().trim().optional(),
  password: z.string().min(8),
})

export const loginSchema = z.object({
  tenantSlug: z.string().trim().min(2),
  email: z.string().email(),
  password: z.string().min(1),
})
