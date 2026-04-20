import { Prisma } from "@prisma/client"

/**
 * Decimal ko number mein normalize karne ke liye helper.
 */
export function decimalToNumber(value: Prisma.Decimal | number | null | undefined): number {
  if (value === null || value === undefined) return 0
  if (typeof value === "number") return value
  return Number(value.toString())
}

/**
 * Date range ko poore din cover karne ke liye use hota hai.
 */
export function dayRange(date: Date): { start: Date; end: Date } {
  const start = new Date(date)
  start.setHours(0, 0, 0, 0)

  const end = new Date(date)
  end.setHours(23, 59, 59, 999)

  return { start, end }
}

/**
 * Asia/Karachi business day ko stable UTC range mein convert karta hai.
 */
export function karachiDayRange(date: Date): { start: Date; end: Date } {
  const year = date.getUTCFullYear()
  const month = date.getUTCMonth()
  const day = date.getUTCDate()
  const karachiOffsetMinutes = 5 * 60
  const startUtc = Date.UTC(year, month, day, 0, 0, 0, 0) - karachiOffsetMinutes * 60 * 1000
  const endUtc = startUtc + 24 * 60 * 60 * 1000 - 1

  return {
    start: new Date(startUtc),
    end: new Date(endUtc),
  }
}

export function slugify(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

export function buildInvoiceNumber(tenantId: number): string {
  const stamp = Date.now()
  const random = Math.floor(Math.random() * 1000)
  return `MS-${tenantId}-${stamp}-${random}`
}

export function paginate(page: number, limit: number): { skip: number; take: number } {
  return {
    skip: (page - 1) * limit,
    take: limit,
  }
}

/**
 * String ya date value ko Date object mein badalte hain.
 */
export function toDate(value?: string | Date): Date | undefined {
  if (!value) return undefined
  return value instanceof Date ? value : new Date(value)
}

/**
 * Date-only string ko din ke start se parse karte hain.
 */
export function toDateOnly(value?: string): Date | undefined {
  if (!value) return undefined
  return new Date(`${value}T00:00:00.000Z`)
}
