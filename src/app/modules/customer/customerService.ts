import { Prisma } from "@prisma/client"
import { db } from "@/core/database"
import { NotFoundException } from "@/core/entities/exceptions"
import { paginate } from "../shared/utils"

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
    const where: Prisma.CustomerWhereInput = {
      tenantId,
      ...(query.isActive !== undefined ? { isActive: query.isActive } : {}),
      ...(query.search
        ? {
            OR: [
              { name: { contains: query.search, mode: "insensitive" } },
              { phone: { contains: query.search, mode: "insensitive" } },
            ],
          }
        : {}),
    }

    const [count, data] = await db.$transaction([
      db.customer.count({ where }),
      db.customer.findMany({
        where,
        orderBy: { createdAt: "desc" },
        ...paginate(query.page, query.limit),
      }),
    ])

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

    return customer
  },

  /**
   * Yahan naya customer create hota hai.
   */
  async create(tenantId: number, payload: Required<CustomerPayload> | CustomerPayload) {
    return db.customer.create({
      data: {
        tenantId,
        name: payload.name || "",
        phone: payload.phone,
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
      data: payload,
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
