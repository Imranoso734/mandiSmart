import { Prisma } from "@prisma/client"
import { db } from "@/core/database"
import { NotFoundException } from "@/core/entities/exceptions"
import { decimalToNumber, paginate } from "../shared/utils"
import { normalizePhone, normalizePhoneSearch } from "../shared/phone"

type CustomerPayload = {
  name?: string
  phone?: string
  address?: string
  notes?: string
  isActive?: boolean
}

export const CustomerService = {
  /**
   * Yahan tenant ke customers list hote hain.
   */
  async list(tenantId: number, query: { page: number; limit: number; search?: string; isActive?: boolean }) {
    const phoneSearch = normalizePhoneSearch(query.search)
    const where: Prisma.CustomerWhereInput = {
      tenantId,
      ...(query.isActive !== undefined ? { isActive: query.isActive } : {}),
      ...(query.search
        ? {
            OR: [
              { name: { contains: query.search, mode: "insensitive" } },
              { phone: { contains: query.search, mode: "insensitive" } },
              ...(phoneSearch ? [{ phone: { contains: phoneSearch, mode: "insensitive" as const } }] : []),
            ],
          }
        : {}),
    }

    const [count, customers] = await db.$transaction([
      db.customer.count({ where }),
      db.customer.findMany({
        where,
        orderBy: { createdAt: "desc" },
        ...paginate(query.page, query.limit),
      }),
    ])

    const data = await attachCustomerBalances(tenantId, customers)

    return { total: count, page: query.page, limit: query.limit, data }
  },

  /**
   * Yahan customer detail milti hai.
   */
  async getById(tenantId: number, id: number) {
    const customer = await db.customer.findFirst({
      where: { id, tenantId },
    })

    if (!customer) {
      throw NotFoundException("customer nahin mila")
    }

    const [enrichedCustomer] = await attachCustomerBalances(tenantId, [customer])
    return enrichedCustomer
  },

  /**
   * Yahan naya customer create hota hai.
   */
  async create(tenantId: number, payload: Required<CustomerPayload> | CustomerPayload) {
    return db.customer.create({
      data: {
        tenantId,
        name: payload.name || "",
        phone: normalizePhone(payload.phone),
        address: payload.address,
        notes: payload.notes,
        isActive: payload.isActive ?? true,
      },
    })
  },

  /**
   * Yahan customer update hota hai.
   */
  async update(tenantId: number, id: number, payload: CustomerPayload) {
    await this.getById(tenantId, id)

    return db.customer.update({
      where: { id },
      data: {
        ...payload,
        ...(payload.phone !== undefined ? { phone: normalizePhone(payload.phone) } : {}),
      },
    })
  },

  /**
   * Yahan customer ko inactive mark karte hain.
   */
  async remove(tenantId: number, id: number) {
    await this.getById(tenantId, id)

    return db.customer.update({
      where: { id },
      data: { isActive: false },
    })
  },
}

async function attachCustomerBalances<T extends { id: number }>(tenantId: number, customers: T[]) {
  if (!customers.length) {
    return customers.map((customer) => ({
      ...customer,
      totalSales: 0,
      totalPayments: 0,
      balance: 0,
    }))
  }

  const customerIds = customers.map((customer) => customer.id)

  const [sales, payments] = await Promise.all([
    db.sale.groupBy({
      by: ["customerId"],
      where: {
        tenantId,
        customerId: { in: customerIds },
      },
      _sum: {
        totalAmount: true,
      },
    }),
    db.payment.groupBy({
      by: ["customerId"],
      where: {
        tenantId,
        customerId: { in: customerIds },
      },
      _sum: {
        amount: true,
      },
    }),
  ])

  const salesMap = new Map(sales.map((entry) => [entry.customerId, decimalToNumber(entry._sum.totalAmount)]))
  const paymentsMap = new Map(payments.map((entry) => [entry.customerId, decimalToNumber(entry._sum.amount)]))

  return customers.map((customer) => {
    const totalSales = salesMap.get(customer.id) ?? 0
    const totalPayments = paymentsMap.get(customer.id) ?? 0

    return {
      ...customer,
      totalSales,
      totalPayments,
      balance: totalSales - totalPayments,
    }
  })
}
