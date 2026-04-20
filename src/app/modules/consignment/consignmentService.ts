import { CommissionType, ConsignmentStatus, Prisma, SettlementStatus } from "@prisma/client"
import { db } from "@/core/database"
import { BadRequestException, NotFoundException } from "@/core/entities/exceptions"
import { decimalToNumber, paginate } from "../shared/utils"
import { calculateCommissionAmount, excludeManualCommissionExpenses } from "../shared/commission"
import { normalizePhone } from "../shared/phone"

type ConsignmentItemInput = {
  productNameUrdu: string
  productNameRoman?: string
  unit: string
  quantityReceived?: number
  baseRate?: number
}

type ConsignmentPayload = {
  supplierId?: number
  vehicleNumber?: string
  driverName?: string
  driverPhone?: string
  arrivalDate?: Date
  notes?: string
  commissionType?: CommissionType
  commissionValue?: number
  items?: ConsignmentItemInput[]
}

export const ConsignmentService = {
  /**
   * Yahan tenant ke consignments list hote hain.
   */
  async list(tenantId: number, query: { page: number; limit: number; search?: string; supplierId?: number; status?: ConsignmentStatus }) {
    const where: Prisma.ConsignmentWhereInput = {
      tenantId,
      ...(query.supplierId ? { supplierId: query.supplierId } : {}),
      ...(query.status ? { status: query.status } : {}),
      ...(query.search
        ? {
            OR: [
              { vehicleNumber: { contains: query.search, mode: "insensitive" } },
              { supplier: { name: { contains: query.search, mode: "insensitive" } } },
            ],
          }
        : {}),
    }

    const [count, data] = await db.$transaction([
      db.consignment.count({ where }),
      db.consignment.findMany({
        where,
        include: {
          supplier: true,
          items: true,
          settlement: true,
        },
        orderBy: { arrivalDate: "desc" },
        ...paginate(query.page, query.limit),
      }),
    ])

    return { total: count, page: query.page, limit: query.limit, data }
  },

  /**
   * Yahan ek consignment ki full detail milti hai.
   */
  async getById(tenantId: number, id: number) {
    const consignment = await db.consignment.findFirst({
      where: { id, tenantId },
      include: {
        supplier: true,
        items: {
          include: {
            saleItems: true,
          },
        },
        expenses: true,
        settlement: true,
      },
    })

    if (!consignment) {
      throw NotFoundException("consignment nahin mili")
    }

    return consignment
  },

  /**
   * Yahan supplier se aaya hua truck record hota hai.
   */
  async create(tenantId: number, userId: number, payload: ConsignmentPayload) {
    await ensureSupplier(tenantId, Number(payload.supplierId))

    return db.consignment.create({
      data: {
        tenantId,
        supplierId: Number(payload.supplierId),
        vehicleNumber: payload.vehicleNumber || "",
        ...(payload.driverName !== undefined ? { driverName: payload.driverName } : {}),
        ...(payload.driverPhone !== undefined ? { driverPhone: normalizePhone(payload.driverPhone) } : {}),
        arrivalDate: payload.arrivalDate || new Date(),
        ...(payload.notes !== undefined ? { notes: payload.notes } : {}),
        ...(payload.commissionType ? { commissionType: payload.commissionType } : {}),
        commissionValue: payload.commissionValue ?? 0,
        createdById: userId,
        items: {
          create: (payload.items || []).map((item) => ({
            productNameUrdu: item.productNameUrdu,
            ...(item.productNameRoman !== undefined ? { productNameRoman: item.productNameRoman } : {}),
            unit: item.unit,
            ...(item.quantityReceived !== undefined ? { quantityReceived: item.quantityReceived } : {}),
            ...(item.baseRate !== undefined ? { baseRate: item.baseRate } : {}),
          })),
        },
      },
      include: {
        supplier: true,
        items: true,
      },
    })
  },

  /**
   * Yahan open consignment update hoti hai.
   */
  async update(tenantId: number, id: number, payload: ConsignmentPayload) {
    const existing = await db.consignment.findFirst({
      where: { id, tenantId },
      include: {
        items: true,
        saleItems: true,
      },
    })

    if (!existing) {
      throw NotFoundException("consignment nahin mili")
    }

    if (existing.status === ConsignmentStatus.CLOSED) {
      throw BadRequestException("closed consignment update nahin ho sakti")
    }

    if (payload.supplierId) {
      await ensureSupplier(tenantId, payload.supplierId)
    }

    return db.$transaction(async (tx) => {
      if (payload.items) {
        if (existing.saleItems.length > 0) {
          throw BadRequestException("jis consignment par sale ho chuki ho uske items replace nahin kiye ja sakte")
        }

        await tx.consignmentItem.deleteMany({ where: { consignmentId: id } })
      }

      const updated = await tx.consignment.update({
        where: { id },
        data: {
          ...(payload.supplierId !== undefined ? { supplierId: payload.supplierId } : {}),
          ...(payload.vehicleNumber !== undefined ? { vehicleNumber: payload.vehicleNumber } : {}),
          ...(payload.driverName !== undefined ? { driverName: payload.driverName } : {}),
          ...(payload.driverPhone !== undefined ? { driverPhone: normalizePhone(payload.driverPhone) } : {}),
          ...(payload.arrivalDate !== undefined ? { arrivalDate: payload.arrivalDate } : {}),
          ...(payload.notes !== undefined ? { notes: payload.notes } : {}),
          ...(payload.commissionType !== undefined ? { commissionType: payload.commissionType } : {}),
          ...(payload.commissionValue !== undefined ? { commissionValue: payload.commissionValue } : {}),
          ...(payload.items
            ? {
                items: {
                  create: payload.items.map((item) => ({
                    productNameUrdu: item.productNameUrdu,
                    ...(item.productNameRoman !== undefined ? { productNameRoman: item.productNameRoman } : {}),
                    unit: item.unit,
                    ...(item.quantityReceived !== undefined ? { quantityReceived: item.quantityReceived } : {}),
                    ...(item.baseRate !== undefined ? { baseRate: item.baseRate } : {}),
                  })),
                },
              }
            : {}),
        },
        include: {
          supplier: true,
          items: true,
        },
      })

      return updated
    })
  },

  /**
   * Yahan open consignment ko inactive karne ke bajaye delete karte hain jab sale na hui ho.
   */
  async remove(tenantId: number, id: number) {
    const consignment = await db.consignment.findFirst({
      where: { id, tenantId },
      include: { saleItems: true },
    })

    if (!consignment) {
      throw NotFoundException("consignment nahin mili")
    }

    if (consignment.saleItems.length > 0) {
      throw BadRequestException("jisme sale ho chuki ho us consignment ko delete nahin kar sakte")
    }

    return db.consignment.delete({ where: { id } })
  },

  /**
   * Yahan manual close ke waqt supplier settlement calculate hota hai.
   */
  async close(tenantId: number, id: number, closedById: number, notes?: string) {
    const consignment = await db.consignment.findFirst({
      where: { id, tenantId },
      include: {
        supplier: true,
        items: {
          include: {
            saleItems: true,
          },
        },
        expenses: true,
        settlement: true,
      },
    })

    if (!consignment) {
      throw NotFoundException("consignment nahin mili")
    }

    if (consignment.status === ConsignmentStatus.CLOSED) {
      throw BadRequestException("consignment pehle hi close hai")
    }

    const grossSales = consignment.items.reduce((sum, item) => {
      const itemSales = item.saleItems.reduce((inner, saleItem) => inner + decimalToNumber(saleItem.lineTotal), 0)
      return sum + itemSales
    }, 0)

    const manualExpenses = excludeManualCommissionExpenses(consignment.expenses)
    const extraExpenseAmount = manualExpenses.reduce((sum, expense) => sum + decimalToNumber(expense.amount), 0)

    const commissionAmount = calculateCommissionAmount(grossSales, consignment.commissionValue)

    const netPayable = grossSales - commissionAmount - extraExpenseAmount
    const amountPaid = consignment.settlement ? decimalToNumber(consignment.settlement.amountPaid) : 0
    const balanceAmount = netPayable - amountPaid

    const settlementStatus =
      amountPaid <= 0
        ? SettlementStatus.PENDING
        : amountPaid < netPayable
          ? SettlementStatus.PARTIAL
          : SettlementStatus.PAID

    return db.$transaction(async (tx) => {
      await tx.consignment.update({
        where: { id },
        data: {
          status: ConsignmentStatus.CLOSED,
          closedById,
          closedAt: new Date(),
          notes: notes ?? consignment.notes,
        },
      })

      return tx.supplierSettlement.upsert({
        where: { consignmentId: id },
        update: {
          grossSales,
          commissionAmount,
          expenseAmount: extraExpenseAmount,
          netPayable,
          balanceAmount,
          status: settlementStatus,
          notes,
          settledAt: settlementStatus === SettlementStatus.PAID ? new Date() : null,
        },
        create: {
          tenantId,
          consignmentId: id,
          supplierId: consignment.supplierId,
          grossSales,
          commissionAmount,
          expenseAmount: extraExpenseAmount,
          netPayable,
          amountPaid,
          balanceAmount,
          status: settlementStatus,
          notes,
          settledAt: settlementStatus === SettlementStatus.PAID ? new Date() : null,
        },
      })
    })
  },
}

async function ensureSupplier(tenantId: number, supplierId: number): Promise<void> {
  const supplier = await db.supplier.findFirst({
    where: { id: supplierId, tenantId },
  })

  if (!supplier) {
    throw NotFoundException("supplier nahin mila")
  }
}
