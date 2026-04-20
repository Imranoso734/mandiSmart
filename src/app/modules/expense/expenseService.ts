import { ExpenseType, Prisma } from "@prisma/client"
import { db } from "@/core/database"
import { BadRequestException, NotFoundException } from "@/core/entities/exceptions"
import { decimalToNumber, paginate } from "../shared/utils"
import { buildDerivedCommissionExpense } from "../shared/commission"

type ExpensePayload = {
  consignmentId?: number
  expenseType?: ExpenseType
  titleUrdu?: string
  amount?: number
  expenseDate?: Date
  notes?: string
}

export const ExpenseService = {
  /**
   * Yahan tenant ke expenses list hote hain.
   */
  async list(tenantId: number, query: { page: number; limit: number; search?: string; consignmentId?: number; expenseType?: ExpensePayload["expenseType"] }) {
    const requestingCommissionOnly = query.expenseType === ExpenseType.COMMISSION
    const where: Prisma.ExpenseWhereInput = {
      tenantId,
      expenseType: requestingCommissionOnly ? undefined : { not: ExpenseType.COMMISSION },
      ...(query.consignmentId ? { consignmentId: query.consignmentId } : {}),
      ...(query.expenseType && !requestingCommissionOnly ? { expenseType: query.expenseType } : {}),
      ...(query.search
        ? {
            OR: [
              { titleUrdu: { contains: query.search, mode: "insensitive" } },
              { notes: { contains: query.search, mode: "insensitive" } },
            ],
          }
        : {}),
    }

    const [count, storedExpenses] = requestingCommissionOnly
      ? [0, []]
      : await db.$transaction([
          db.expense.count({ where }),
          db.expense.findMany({
            where,
            include: {
              consignment: true,
            },
            orderBy: { expenseDate: "desc" },
            ...paginate(query.page, query.limit),
          }),
        ])

    const derivedCommissionExpenses = await buildCommissionExpenses({
      tenantId,
      consignmentId: query.consignmentId,
      search: query.search,
    })

    const filteredDerivedCommissionExpenses = requestingCommissionOnly
      ? derivedCommissionExpenses
      : query.expenseType
        ? derivedCommissionExpenses.filter((expense) => expense.expenseType === query.expenseType)
        : derivedCommissionExpenses

    const data = [...storedExpenses, ...filteredDerivedCommissionExpenses].sort(
      (left, right) => right.expenseDate.getTime() - left.expenseDate.getTime(),
    )

    return {
      total: count + filteredDerivedCommissionExpenses.length,
      page: query.page,
      limit: query.limit,
      data,
    }
  },

  /**
   * Yahan expense detail milti hai.
   */
  async getById(tenantId: number, id: number) {
    const expense = await db.expense.findFirst({
      where: { id, tenantId },
      include: { consignment: true },
    })

    if (!expense) {
      throw NotFoundException("expense nahin mila")
    }

    return expense
  },

  /**
   * Yahan labour, vehicle rent ya doosra kharcha record hota hai.
   */
  async create(tenantId: number, userId: number, payload: ExpensePayload) {
    if (!payload.expenseType) {
      throw new Error("expenseType required hai")
    }
    if (payload.expenseType === ExpenseType.COMMISSION) {
      throw BadRequestException("کمیشن اب گاڑی کی فروخت سے خودکار طور پر نکلتا ہے")
    }
    if (payload.consignmentId) {
      await ensureConsignment(tenantId, payload.consignmentId)
    }

    return db.expense.create({
      data: {
        tenantId,
        ...(payload.consignmentId ? { consignmentId: payload.consignmentId } : {}),
        expenseType: payload.expenseType,
        titleUrdu: payload.titleUrdu || "",
        amount: payload.amount ?? 0,
        expenseDate: payload.expenseDate || new Date(),
        ...(payload.notes !== undefined ? { notes: payload.notes } : {}),
        createdById: userId,
      },
      include: { consignment: true },
    })
  },

  /**
   * Yahan expense update hota hai.
   */
  async update(tenantId: number, id: number, payload: ExpensePayload) {
    const existing = await this.getById(tenantId, id)

    if (existing.expenseType === ExpenseType.COMMISSION || payload.expenseType === ExpenseType.COMMISSION) {
      throw BadRequestException("کمیشن اب الگ خرچے کے طور پر edit نہیں ہو سکتا")
    }

    if (payload.consignmentId) {
      await ensureConsignment(tenantId, payload.consignmentId)
    }

    return db.expense.update({
      where: { id },
      data: payload,
      include: { consignment: true },
    })
  },

  /**
   * Yahan expense delete hota hai.
   */
  async remove(tenantId: number, id: number) {
    await this.getById(tenantId, id)
    return db.expense.delete({ where: { id } })
  },
}

async function ensureConsignment(tenantId: number, consignmentId: number): Promise<void> {
  const consignment = await db.consignment.findFirst({ where: { id: consignmentId, tenantId } })
  if (!consignment) {
    throw NotFoundException("consignment nahin mili")
  }
}

async function buildCommissionExpenses({
  tenantId,
  consignmentId,
  search,
}: {
  tenantId: number
  consignmentId?: number
  search?: string
}) {
  const consignments = await db.consignment.findMany({
    where: {
      tenantId,
      ...(consignmentId ? { id: consignmentId } : {}),
    },
    select: {
      id: true,
      arrivalDate: true,
      commissionValue: true,
      saleItems: {
        select: {
          lineTotal: true,
        },
      },
    },
  })

  return consignments
    .map((consignment) => {
      const grossSales = consignment.saleItems.reduce((sum, saleItem) => sum + decimalToNumber(saleItem.lineTotal), 0)
      return buildDerivedCommissionExpense(consignment, grossSales)
    })
    .filter((expense): expense is NonNullable<typeof expense> => expense !== null)
    .filter((expense) => {
      if (!search) return true
      const normalizedSearch = search.toLowerCase()
      return (
        expense.titleUrdu.toLowerCase().includes(normalizedSearch) ||
        (expense.notes ?? "").toLowerCase().includes(normalizedSearch)
      )
    })
}
