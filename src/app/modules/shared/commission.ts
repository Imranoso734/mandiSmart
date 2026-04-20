import { Prisma } from "@prisma/client"
import { decimalToNumber } from "./utils"

type ConsignmentCommissionInput = {
  id: number
  arrivalDate: Date
  commissionValue: Prisma.Decimal | number | null | undefined
}

type ConsignmentExpenseInput = {
  id: number
  consignmentId: number | null
  expenseType: string
  titleUrdu: string
  amount: number
  expenseDate: Date
  notes: string | null
  createdAt?: Date
  updatedAt?: Date
  consignment?: unknown
}

/**
 * Sales ke against consignment commission hamesha percentage se nikalti hai.
 */
export function calculateCommissionAmount(
  grossSales: number,
  commissionValue: Prisma.Decimal | number | null | undefined,
): number {
  const percentage = decimalToNumber(commissionValue)
  if (percentage <= 0 || grossSales <= 0) {
    return 0
  }

  return (grossSales * percentage) / 100
}

export function buildDerivedCommissionExpense(
  consignment: ConsignmentCommissionInput,
  grossSales: number,
): ConsignmentExpenseInput | null {
  const amount = calculateCommissionAmount(grossSales, consignment.commissionValue)

  if (amount <= 0) {
    return null
  }

  return {
    id: -consignment.id,
    consignmentId: consignment.id,
    expenseType: "COMMISSION",
    titleUrdu: "خودکار کمیشن",
    amount,
    expenseDate: consignment.arrivalDate,
    notes: "یہ کمیشن فروخت کے مطابق خودکار طور پر نکالا گیا ہے",
  }
}

export function excludeManualCommissionExpenses<T extends { expenseType: string }>(expenses: T[]) {
  return expenses.filter((expense) => expense.expenseType !== "COMMISSION")
}
