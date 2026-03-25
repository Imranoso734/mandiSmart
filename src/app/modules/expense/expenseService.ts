import { ExpenseType, Prisma } from "@prisma/client"
import { db } from "@/core/database"
import { NotFoundException } from "@/core/entities/exceptions"
import { paginate } from "../shared/utils"

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
    const where: Prisma.ExpenseWhereInput = {
      tenantId,
      ...(query.consignmentId ? { consignmentId: query.consignmentId } : {}),
      ...(query.expenseType ? { expenseType: query.expenseType } : {}),
      ...(query.search
        ? {
            OR: [
              { titleUrdu: { contains: query.search, mode: "insensitive" } },
              { notes: { contains: query.search, mode: "insensitive" } },
            ],
          }
        : {}),
    }

    const [count, data] = await db.$transaction([
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

    return { total: count, page: query.page, limit: query.limit, data }
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
    await this.getById(tenantId, id)

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
