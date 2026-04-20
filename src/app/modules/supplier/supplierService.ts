import { Prisma } from "@prisma/client"
import { db } from "@/core/database"
import { NotFoundException } from "@/core/entities/exceptions"
import { normalizePhone, normalizePhoneSearch } from "../shared/phone"
import { paginate } from "../shared/utils"

type SupplierPayload = {
  name?: string
  phone?: string
  address?: string
  notes?: string
  isActive?: boolean
}

export const SupplierService = {
  /**
   * Yahan tenant ke suppliers list hote hain.
   */
  async list(tenantId: number, query: { page: number; limit: number; search?: string; isActive?: boolean }) {
    const phoneSearch = normalizePhoneSearch(query.search)
    const where: Prisma.SupplierWhereInput = {
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

    const [count, data] = await db.$transaction([
      db.supplier.count({ where }),
      db.supplier.findMany({
        where,
        orderBy: { createdAt: "desc" },
        ...paginate(query.page, query.limit),
      }),
    ])

    return { total: count, page: query.page, limit: query.limit, data }
  },

  /**
   * Yahan supplier detail milti hai.
   */
  async getById(tenantId: number, id: number) {
    const supplier = await db.supplier.findFirst({
      where: { id, tenantId },
    })

    if (!supplier) {
      throw NotFoundException("supplier nahin mila")
    }

    return supplier
  },

  /**
   * Yahan naya supplier create hota hai.
   */
  async create(tenantId: number, payload: Required<SupplierPayload> | SupplierPayload) {
    return db.supplier.create({
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
   * Yahan supplier update hota hai.
   */
  async update(tenantId: number, id: number, payload: SupplierPayload) {
    await this.getById(tenantId, id)

    return db.supplier.update({
      where: { id },
      data: {
        ...payload,
        ...(payload.phone !== undefined ? { phone: normalizePhone(payload.phone) } : {}),
      },
    })
  },

  /**
   * Yahan supplier ko inactive mark karte hain.
   */
  async remove(tenantId: number, id: number) {
    await this.getById(tenantId, id)

    return db.supplier.update({
      where: { id },
      data: { isActive: false },
    })
  },
}
