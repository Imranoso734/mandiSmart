import { BadRequestException } from "@/core/entities/exceptions"

export const PHONE_INPUT_PATTERN = "^03\\d{2}-?\\d{7}$"
export const OPTIONAL_PHONE_INPUT_PATTERN = "^(|03\\d{2}-?\\d{7})$"

export function normalizePhone(value?: string | null) {
  if (value === undefined || value === null) return undefined

  const trimmed = String(value).trim()
  if (!trimmed) return undefined

  const digits = trimmed.replace(/\D/g, "")
  if (!/^03\d{9}$/.test(digits)) {
    throw BadRequestException("فون نمبر 03 سے شروع اور 11 ہندسوں کا ہونا چاہیے")
  }

  return digits
}

export function normalizePhoneSearch(value?: string) {
  const digits = String(value ?? "").replace(/\D/g, "")
  return digits || undefined
}
