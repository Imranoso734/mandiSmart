import { Prisma } from "@prisma/client"
import { db } from "@/core/database"
import { NotFoundException } from "@/core/entities/exceptions"

export const TenantService = {
  /**
   * Yahan current tenant ka profile milta hai.
   */
  async getCurrent(tenantId: number) {
    const tenant = await db.tenant.findUnique({
      where: { id: tenantId },
      include: {
        _count: {
          select: {
            users: true,
            customers: true,
            suppliers: true,
            consignments: true,
          },
        },
      },
    })

    if (!tenant) {
      throw NotFoundException("tenant nahin mila")
    }

    return tenant
  },

  /**
   * Yahan owner apna tenant update karta hai.
   */
  async updateCurrent(tenantId: number, payload: Prisma.TenantUpdateInput) {
    const tenant = await db.tenant.findUnique({ where: { id: tenantId } })
    if (!tenant) {
      throw NotFoundException("tenant nahin mila")
    }

    return db.tenant.update({
      where: { id: tenantId },
      data: payload,
    })
  },
}
