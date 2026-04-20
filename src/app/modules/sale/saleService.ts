import { ConsignmentStatus, Prisma } from "@prisma/client"
import { db } from "@/core/database"
import { BadRequestException, NotFoundException } from "@/core/entities/exceptions"
import { buildInvoiceNumber, decimalToNumber, paginate } from "../shared/utils"

type SaleItemInput = {
  consignmentId: number
  consignmentItemId: number
  productNameUrdu: string
  quantity: number
  rate: number
}

type SalePayload = {
  customerId?: number
  saleDate?: Date
  notes?: string
  items?: SaleItemInput[]
}

export const SaleService = {
  /**
   * Yahan tenant ki sales list hoti hain.
   */
  async list(tenantId: number, query: { page: number; limit: number; search?: string; customerId?: number }) {
    const where: Prisma.SaleWhereInput = {
      tenantId,
      ...(query.customerId ? { customerId: query.customerId } : {}),
      ...(query.search
        ? {
            OR: [
              { invoiceNumber: { contains: query.search, mode: "insensitive" } },
              { customer: { name: { contains: query.search, mode: "insensitive" } } },
            ],
          }
        : {}),
    }

    const [count, data] = await db.$transaction([
      db.sale.count({ where }),
      db.sale.findMany({
        where,
        include: {
          customer: true,
          items: true,
        },
        orderBy: { saleDate: "desc" },
        ...paginate(query.page, query.limit),
      }),
    ])

    return { total: count, page: query.page, limit: query.limit, data }
  },

  /**
   * Yahan sale detail milti hai.
   */
  async getById(tenantId: number, id: number) {
    const sale = await db.sale.findFirst({
      where: { id, tenantId },
      include: {
        customer: true,
        items: true,
      },
    })

    if (!sale) {
      throw NotFoundException("sale nahin mili")
    }

    return sale
  },

  /**
   * Yahan multi-item sale create hoti hai aur customer ledger debit barhta hai.
   */
  async create(tenantId: number, userId: number, payload: Required<SalePayload> | SalePayload) {
    await ensureCustomer(tenantId, Number(payload.customerId))
    const items = payload.items || []
    await validateSaleItems(tenantId, items)

    const totalAmount = items.reduce((sum, item) => sum + item.quantity * item.rate, 0)

    return db.sale.create({
      data: {
        tenantId,
        customerId: Number(payload.customerId),
        invoiceNumber: buildInvoiceNumber(tenantId),
        saleDate: payload.saleDate || new Date(),
        notes: payload.notes,
        totalAmount,
        createdById: userId,
        items: {
          create: items.map((item) => ({
            consignmentId: item.consignmentId,
            consignmentItemId: item.consignmentItemId,
            productNameUrdu: item.productNameUrdu,
            quantity: item.quantity,
            rate: item.rate,
            lineTotal: item.quantity * item.rate,
          })),
        },
      },
      include: {
        customer: true,
        items: true,
      },
    })
  },

  /**
   * Yahan sale update hoti hai aur items dobara validate hote hain.
   */
  async update(tenantId: number, id: number, payload: SalePayload) {
    const existing = await db.sale.findFirst({
      where: { id, tenantId },
      include: { items: true },
    })

    if (!existing) {
      throw NotFoundException("sale nahin mili")
    }

    if (payload.customerId) {
      await ensureCustomer(tenantId, payload.customerId)
    }

    const items = payload.items || existing.items.map((item) => ({
      consignmentId: item.consignmentId,
      consignmentItemId: item.consignmentItemId,
      productNameUrdu: item.productNameUrdu,
      quantity: decimalToNumber(item.quantity),
      rate: decimalToNumber(item.rate),
    }))

    await validateSaleItems(tenantId, items, id)

    const totalAmount = items.reduce((sum, item) => sum + item.quantity * item.rate, 0)

    return db.$transaction(async (tx) => {
      if (payload.items) {
        await tx.saleItem.deleteMany({ where: { saleId: id } })
      }

      const updated = await tx.sale.update({
        where: { id },
        data: {
          ...(payload.customerId !== undefined ? { customerId: payload.customerId } : {}),
          ...(payload.saleDate !== undefined ? { saleDate: payload.saleDate } : {}),
          ...(payload.notes !== undefined ? { notes: payload.notes } : {}),
          totalAmount,
          ...(payload.items
            ? {
                items: {
                  create: payload.items.map((item) => ({
                    consignmentId: item.consignmentId,
                    consignmentItemId: item.consignmentItemId,
                    productNameUrdu: item.productNameUrdu,
                    quantity: item.quantity,
                    rate: item.rate,
                    lineTotal: item.quantity * item.rate,
                  })),
                },
              }
            : {}),
        },
        include: {
          customer: true,
          items: true,
        },
      })

      return updated
    })
  },

  /**
   * Yahan sale delete hoti hai aur ledger se debit khatam ho jata hai.
   */
  async remove(tenantId: number, id: number) {
    await this.getById(tenantId, id)
    return db.sale.delete({ where: { id } })
  },
}

async function ensureCustomer(tenantId: number, customerId: number): Promise<void> {
  const customer = await db.customer.findFirst({ where: { id: customerId, tenantId } })
  if (!customer) {
    throw NotFoundException("customer nahin mila")
  }
}

async function validateSaleItems(tenantId: number, items: SaleItemInput[], currentSaleId?: number): Promise<void> {
  const uniqueItemIds = new Set(items.map((item) => item.consignmentItemId))
  if (uniqueItemIds.size !== items.length) {
    throw BadRequestException("ek hi consignment item ko ek sale mein do martaba use nahin kar sakte")
  }

  for (const item of items) {
    const consignmentItem = await db.consignmentItem.findFirst({
      where: {
        id: item.consignmentItemId,
        consignmentId: item.consignmentId,
        consignment: {
          tenantId,
          status: ConsignmentStatus.OPEN,
        },
      },
      include: {
        consignment: true,
      },
    })

    if (!consignmentItem) {
      throw BadRequestException("sale item ki consignment ya item valid nahin hai")
    }

    const aggregate = await db.saleItem.aggregate({
      where: {
        consignmentItemId: item.consignmentItemId,
        ...(currentSaleId ? { saleId: { not: currentSaleId } } : {}),
      },
      _sum: {
        quantity: true,
      },
    })

    if (consignmentItem.quantityReceived !== null) {
      const soldQuantity = decimalToNumber(aggregate._sum.quantity)
      const availableQuantity = decimalToNumber(consignmentItem.quantityReceived) - soldQuantity

      if (item.quantity > availableQuantity) {
        throw BadRequestException(`item ${item.productNameUrdu} ki available quantity kam hai`)
      }
    }
  }
}
