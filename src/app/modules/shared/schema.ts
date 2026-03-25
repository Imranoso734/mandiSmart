import { z, ZodTypeAny } from "zod"
import { ValidationException } from "@/core/entities/exceptions"

export const idParamSchema = z.object({
  id: z.coerce.number().int().positive(),
})

export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(20),
  search: z.string().trim().optional(),
})

/**
 * Yahan request payload ko validate karke typed value nikalte hain.
 */
export function parseSchema<T extends ZodTypeAny>(
  schema: T,
  input: unknown,
): z.infer<T> {
  const result = schema.safeParse(input)
  if (!result.success) {
    throw ValidationException(result.error.issues.map((issue) => issue.message).join(", "))
  }

  return result.data
}
