import { PaymentMethod, Prisma } from "@prisma/client"
import { db } from "@/core/database"
import { NotFoundException } from "@/core/entities/exceptions"
import { paginate } from "../shared/utils"

type PaymentPayload = {
  customerId?: number
  amount?: number
  paymentDate?: Date
  method?: PaymentMethod
  reference?: string
  notes?: string
}

export const PaymentService = {
  /**
   * Yahan customer payments list hoti hain.
   */
  async list(tenantId: number, query: { page: number; limit: number; search?: string; customerId?: number; method?: PaymentPayload["method"] }) {
    const where: Prisma.PaymentWhereInput = {
      tenantId,
      ...(query.customerId ? { customerId: query.customerId } : {}),
      ...(query.method ? { method: query.method } : {}),
      ...(query.search
        ? {
            OR: [
              { reference: { contains: query.search, mode: "insensitive" } },
              { customer: { name: { contains: query.search, mode: "insensitive" } } },
            ],
          }
        : {}),
    }

    const [count, data] = await db.$transaction([
      db.payment.count({ where }),
      db.payment.findMany({
        where,
        include: { customer: true },
        orderBy: { paymentDate: "desc" },
        ...paginate(query.page, query.limit),
      }),
    ])

    return { total: count, page: query.page, limit: query.limit, data }
  },

  /**
   * Yahan payment detail milti hai.
   */
  async getById(tenantId: number, id: number) {
    const payment = await db.payment.findFirst({
      where: { id, tenantId },
      include: { customer: true },
    })

    if (!payment) {
      throw NotFoundException("payment nahin mili")
    }

    return payment
  },

  /**
   * Yahan customer ki credit entry create hoti hai.
   */
  async create(tenantId: number, userId: number, payload: PaymentPayload) {
    await ensureCustomer(tenantId, Number(payload.customerId))

    return db.payment.create({
      data: {
        tenantId,
        customerId: Number(payload.customerId),
        amount: payload.amount ?? 0,
        paymentDate: payload.paymentDate || new Date(),
        ...(payload.method ? { method: payload.method } : {}),
        ...(payload.reference !== undefined ? { reference: payload.reference } : {}),
        ...(payload.notes !== undefined ? { notes: payload.notes } : {}),
        createdById: userId,
      },
      include: { customer: true },
    })
  },

  /**
   * Yahan payment update hoti hai.
   */
  async update(tenantId: number, id: number, payload: PaymentPayload) {
    await this.getById(tenantId, id)

    if (payload.customerId) {
      await ensureCustomer(tenantId, payload.customerId)
    }

    return db.payment.update({
      where: { id },
      data: payload,
      include: { customer: true },
    })
  },

  /**
   * Yahan payment delete hoti hai.
   */
  async remove(tenantId: number, id: number) {
    await this.getById(tenantId, id)
    return db.payment.delete({ where: { id } })
  },
}

async function ensureCustomer(tenantId: number, customerId: number): Promise<void> {
  const customer = await db.customer.findFirst({ where: { id: customerId, tenantId } })
  if (!customer) {
    throw NotFoundException("customer nahin mila")
  }
}
