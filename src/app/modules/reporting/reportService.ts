import { db } from "@/core/database"
import { NotFoundException } from "@/core/entities/exceptions"
import { dayRange, decimalToNumber } from "../shared/utils"

export const ReportService = {
  /**
   * Yahan rozana ki sales aur collections Urdu labels ke saath milti hain.
   */
  async dailySales(tenantId: number, date: Date) {
    const { start, end } = dayRange(date)

    const sales = await db.sale.findMany({
      where: {
        tenantId,
        saleDate: { gte: start, lte: end },
      },
      include: {
        customer: true,
        items: true,
      },
      orderBy: { saleDate: "asc" },
    })

    const totalSales = sales.reduce((sum, sale) => sum + decimalToNumber(sale.totalAmount), 0)
    const totalItems = sales.reduce((sum, sale) => sum + sale.items.length, 0)

    return {
      date: date.toISOString(),
      totalSales,
      totalInvoices: sales.length,
      totalItems,
      customers: new Set(sales.map((sale) => sale.customerId)).size,
      sales: sales.map((sale) => mapSale(sale)),
    }
  },

  /**
   * Yahan customer khata date-wise running balance ke saath banta hai.
   */
  async customerLedger(tenantId: number, customerId: number, from?: Date, to?: Date) {
    const customer = await db.customer.findFirst({
      where: { id: customerId, tenantId },
    })

    if (!customer) {
      throw NotFoundException("customer nahin mila")
    }

    const sales = await db.sale.findMany({
      where: {
        tenantId,
        customerId,
        ...(from || to
          ? {
              saleDate: {
                ...(from ? { gte: from } : {}),
                ...(to ? { lte: to } : {}),
              },
            }
          : {}),
      },
      orderBy: { saleDate: "asc" },
    })

    const payments = await db.payment.findMany({
      where: {
        tenantId,
        customerId,
        ...(from || to
          ? {
              paymentDate: {
                ...(from ? { gte: from } : {}),
                ...(to ? { lte: to } : {}),
              },
            }
          : {}),
      },
      orderBy: { paymentDate: "asc" },
    })

    const totalSales = sales.reduce((sum, sale) => sum + decimalToNumber(sale.totalAmount), 0)
    const totalPayments = payments.reduce((sum, payment) => sum + decimalToNumber(payment.amount), 0)

    const entries = [
      ...sales.map((sale) => ({
        id: `sale-${sale.id}`,
        date: sale.saleDate,
        type: "SALE" as const,
        description: `سیل ${sale.invoiceNumber}`,
        debit: decimalToNumber(sale.totalAmount),
        credit: 0,
        reference: sale.invoiceNumber,
      })),
      ...payments.map((payment) => ({
        id: `payment-${payment.id}`,
        date: payment.paymentDate,
        type: "PAYMENT" as const,
        description: `ادائیگی ${payment.method}`,
        debit: 0,
        credit: decimalToNumber(payment.amount),
        reference: payment.reference,
      })),
    ].sort((a, b) => a.date.getTime() - b.date.getTime())

    let balance = 0

    return {
      customer: {
        id: customer.id,
        name: customer.name,
        phone: customer.phone,
        address: customer.address,
        notes: customer.notes,
        isActive: customer.isActive,
      },
      from: from?.toISOString(),
      to: to?.toISOString(),
      totalSales,
      totalPayments,
      balance: totalSales - totalPayments,
      entries: entries.map((entry) => {
        balance += entry.debit - entry.credit
        return {
          ...entry,
          balance,
        }
      }),
    }
  },

  /**
   * Yahan consignment ka maal, sale aur remaining summary milti hai.
   */
  async consignmentSummary(tenantId: number, consignmentId: number) {
    const consignment = await db.consignment.findFirst({
      where: { id: consignmentId, tenantId },
      include: {
        supplier: true,
        items: {
          include: {
            saleItems: true,
          },
        },
        expenses: {
          include: {
            consignment: true,
          },
        },
        settlement: true,
      },
    })

    if (!consignment) {
      throw NotFoundException("consignment nahin mili")
    }

    const sales = await db.sale.findMany({
      where: {
        tenantId,
        items: {
          some: {
            consignmentId,
          },
        },
      },
      include: {
        customer: true,
        items: {
          where: { consignmentId },
        },
      },
      orderBy: { saleDate: "asc" },
    })

    const mappedSales = sales.map((sale) => mapSale(sale, true))
    const totalSales = mappedSales.reduce((sum, sale) => sum + sale.totalAmount, 0)
    const totalExpenses = consignment.expenses.reduce((sum, expense) => sum + decimalToNumber(expense.amount), 0)
    const totalItemsSold = consignment.items.reduce(
      (sum, item) => sum + item.saleItems.reduce((inner, saleItem) => inner + decimalToNumber(saleItem.quantity), 0),
      0,
    )
    const totalItemsRemaining = consignment.items.reduce(
      (sum, item) =>
        sum +
        (decimalToNumber(item.quantityReceived) -
          item.saleItems.reduce((inner, saleItem) => inner + decimalToNumber(saleItem.quantity), 0)),
      0,
    )

    return {
      consignment: {
        id: consignment.id,
        supplierId: consignment.supplierId,
        supplier: consignment.supplier,
        vehicleNumber: consignment.vehicleNumber,
        driverName: consignment.driverName,
        driverPhone: consignment.driverPhone,
        arrivalDate: consignment.arrivalDate,
        notes: consignment.notes,
        commissionType: consignment.commissionType,
        commissionValue: decimalToNumber(consignment.commissionValue),
        status: consignment.status,
        items: consignment.items.map((item) => {
          const quantitySold = item.saleItems.reduce((sum, saleItem) => sum + decimalToNumber(saleItem.quantity), 0)
          return {
            id: item.id,
            consignmentId: item.consignmentId,
            productNameUrdu: item.productNameUrdu,
            productNameRoman: item.productNameRoman,
            unit: item.unit,
            quantityReceived: decimalToNumber(item.quantityReceived),
            baseRate: item.baseRate === null ? null : decimalToNumber(item.baseRate),
            quantitySold,
            remainingQuantity: decimalToNumber(item.quantityReceived) - quantitySold,
          }
        }),
      },
      totalSales,
      totalExpenses,
      totalItemsSold,
      totalItemsRemaining,
      sales: mappedSales,
      expenses: consignment.expenses.map(mapExpense),
    }
  },

  /**
   * Yahan supplier settlement report supplier ko dene ke liye ready hoti hai.
   */
  async supplierSettlement(tenantId: number, consignmentId: number) {
    const settlement = await db.supplierSettlement.findFirst({
      where: {
        tenantId,
        consignmentId,
      },
      include: {
        supplier: true,
        consignment: {
          include: {
            items: true,
          },
        },
      },
    })

    if (!settlement) {
      throw NotFoundException("supplier settlement abhi tak create nahin hui")
    }

    return {
      consignment: {
        id: settlement.consignment.id,
        supplierId: settlement.supplierId,
        vehicleNumber: settlement.consignment.vehicleNumber,
        driverName: settlement.consignment.driverName,
        driverPhone: settlement.consignment.driverPhone,
        arrivalDate: settlement.consignment.arrivalDate,
        notes: settlement.consignment.notes,
        commissionType: settlement.consignment.commissionType,
        commissionValue: decimalToNumber(settlement.consignment.commissionValue),
        status: settlement.consignment.status,
        items: settlement.consignment.items.map((item) => ({
          id: item.id,
          consignmentId: item.consignmentId,
          productNameUrdu: item.productNameUrdu,
          productNameRoman: item.productNameRoman,
          unit: item.unit,
          quantityReceived: decimalToNumber(item.quantityReceived),
          baseRate: item.baseRate === null ? null : decimalToNumber(item.baseRate),
        })),
      },
      supplier: settlement.supplier,
      grossSale: decimalToNumber(settlement.grossSales),
      commissionAmount: decimalToNumber(settlement.commissionAmount),
      expenseTotal: decimalToNumber(settlement.expenseAmount),
      payable: decimalToNumber(settlement.netPayable),
      status: settlement.status,
    }
  },
}

function toNumeric(value: { toString(): string } | number | null | undefined) {
  if (value === null || value === undefined) return 0
  return typeof value === "number" ? value : Number(value.toString())
}

function mapSale(sale: {
  id: number
  customerId: number
  saleDate: Date
  notes: string | null
  totalAmount: { toString(): string } | number
  createdAt?: Date
  updatedAt?: Date
  customer?: {
    id: number
    name: string
    phone: string | null
    address?: string | null
    notes?: string | null
    isActive?: boolean
  } | null
  items: Array<{
    id: number
    consignmentId: number
    consignmentItemId: number
    productNameUrdu: string
    quantity: { toString(): string } | number
    rate: { toString(): string } | number
    lineTotal: { toString(): string } | number
  }>
}, useItemTotals = false) {
  const items = sale.items.map((item) => ({
    id: item.id,
    consignmentId: item.consignmentId,
    consignmentItemId: item.consignmentItemId,
    productNameUrdu: item.productNameUrdu,
    quantity: toNumeric(item.quantity),
    rate: toNumeric(item.rate),
    lineTotal: toNumeric(item.lineTotal),
  }))

  return {
    id: sale.id,
    customerId: sale.customerId,
    customer: sale.customer ?? undefined,
    saleDate: sale.saleDate,
    notes: sale.notes,
    items,
    totalAmount: useItemTotals
      ? items.reduce((sum, item) => sum + item.lineTotal, 0)
      : toNumeric(sale.totalAmount),
    createdAt: sale.createdAt,
    updatedAt: sale.updatedAt,
  }
}

function mapExpense(expense: {
  id: number
  consignmentId: number | null
  expenseType: string
  titleUrdu: string
  amount: { toString(): string } | number
  expenseDate: Date
  notes: string | null
  createdAt?: Date
  updatedAt?: Date
  consignment?: unknown
}) {
  return {
    id: expense.id,
    consignmentId: expense.consignmentId,
    consignment: expense.consignment,
    expenseType: expense.expenseType,
    titleUrdu: expense.titleUrdu,
    amount: toNumeric(expense.amount),
    expenseDate: expense.expenseDate,
    notes: expense.notes,
    createdAt: expense.createdAt,
    updatedAt: expense.updatedAt,
  }
}
