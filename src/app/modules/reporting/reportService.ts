import { db } from "@/core/database"
import { NotFoundException } from "@/core/entities/exceptions"
import { dayRange, decimalToNumber } from "../shared/utils"

export const ReportService = {
  /**
   * Yahan rozana ki sales aur collections Urdu labels ke saath milti hain.
   */
  async dailySales(tenantId: number, date: Date) {
    const { start, end } = dayRange(date)

    const [sales, payments, expenses] = await Promise.all([
      db.sale.findMany({
        where: {
          tenantId,
          saleDate: { gte: start, lte: end },
        },
        include: {
          customer: true,
          items: true,
        },
        orderBy: { saleDate: "asc" },
      }),
      db.payment.findMany({
        where: {
          tenantId,
          paymentDate: { gte: start, lte: end },
        },
        include: { customer: true },
        orderBy: { paymentDate: "asc" },
      }),
      db.expense.findMany({
        where: {
          tenantId,
          expenseDate: { gte: start, lte: end },
        },
        orderBy: { expenseDate: "asc" },
      }),
    ])

    const totalSales = sales.reduce((sum, sale) => sum + decimalToNumber(sale.totalAmount), 0)
    const totalCollections = payments.reduce((sum, payment) => sum + decimalToNumber(payment.amount), 0)
    const totalExpenses = expenses.reduce((sum, expense) => sum + decimalToNumber(expense.amount), 0)

    return {
      reportTitle: "روزانہ سیل رپورٹ",
      reportDate: date.toISOString(),
      summary: {
        totalSales,
        totalCollections,
        totalExpenses,
        netCashFlow: totalCollections - totalExpenses,
      },
      sales: sales.map((sale) => ({
        id: sale.id,
        billNo: sale.invoiceNumber,
        customerName: sale.customer.name,
        amount: decimalToNumber(sale.totalAmount),
        items: sale.items.map((item) => ({
          productNameUrdu: item.productNameUrdu,
          quantity: decimalToNumber(item.quantity),
          rate: decimalToNumber(item.rate),
          total: decimalToNumber(item.lineTotal),
        })),
      })),
      payments: payments.map((payment) => ({
        id: payment.id,
        customerName: payment.customer.name,
        amount: decimalToNumber(payment.amount),
        method: payment.method,
        reference: payment.reference,
      })),
      expenses: expenses.map((expense) => ({
        id: expense.id,
        titleUrdu: expense.titleUrdu,
        amount: decimalToNumber(expense.amount),
        type: expense.expenseType,
      })),
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

    const entries = [
      ...sales.map((sale) => ({
        date: sale.saleDate,
        type: "SALE",
        description: `سیل ${sale.invoiceNumber}`,
        debit: decimalToNumber(sale.totalAmount),
        credit: 0,
      })),
      ...payments.map((payment) => ({
        date: payment.paymentDate,
        type: "PAYMENT",
        description: `ادائیگی ${payment.method}`,
        debit: 0,
        credit: decimalToNumber(payment.amount),
      })),
    ].sort((a, b) => a.date.getTime() - b.date.getTime())

    let runningBalance = 0

    return {
      reportTitle: "کسٹمر کھاتہ رپورٹ",
      customer: {
        id: customer.id,
        name: customer.name,
        phone: customer.phone,
      },
      entries: entries.map((entry) => {
        runningBalance += entry.debit - entry.credit
        return {
          ...entry,
          runningBalance,
        }
      }),
      closingBalance: runningBalance,
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
        expenses: true,
        settlement: true,
      },
    })

    if (!consignment) {
      throw NotFoundException("consignment nahin mili")
    }

    const items = consignment.items.map((item) => {
      const soldQuantity = item.saleItems.reduce((sum, saleItem) => sum + decimalToNumber(saleItem.quantity), 0)
      const soldValue = item.saleItems.reduce((sum, saleItem) => sum + decimalToNumber(saleItem.lineTotal), 0)
      return {
        id: item.id,
        productNameUrdu: item.productNameUrdu,
        quantityReceived: decimalToNumber(item.quantityReceived),
        quantitySold: soldQuantity,
        quantityRemaining: decimalToNumber(item.quantityReceived) - soldQuantity,
        soldValue,
      }
    })

    return {
      reportTitle: "کنسائنمنٹ خلاصہ رپورٹ",
      consignment: {
        id: consignment.id,
        vehicleNumber: consignment.vehicleNumber,
        arrivalDate: consignment.arrivalDate,
        status: consignment.status,
        supplierName: consignment.supplier.name,
      },
      items,
      expenses: consignment.expenses.map((expense) => ({
        titleUrdu: expense.titleUrdu,
        amount: decimalToNumber(expense.amount),
      })),
      settlement: consignment.settlement
        ? {
            grossSales: decimalToNumber(consignment.settlement.grossSales),
            commissionAmount: decimalToNumber(consignment.settlement.commissionAmount),
            expenseAmount: decimalToNumber(consignment.settlement.expenseAmount),
            netPayable: decimalToNumber(consignment.settlement.netPayable),
            balanceAmount: decimalToNumber(consignment.settlement.balanceAmount),
          }
        : null,
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
        consignment: true,
      },
    })

    if (!settlement) {
      throw NotFoundException("supplier settlement abhi tak create nahin hui")
    }

    return {
      reportTitle: "سپلائر سیٹلمنٹ رپورٹ",
      supplier: {
        id: settlement.supplier.id,
        name: settlement.supplier.name,
        phone: settlement.supplier.phone,
      },
      consignment: {
        id: settlement.consignment.id,
        vehicleNumber: settlement.consignment.vehicleNumber,
        arrivalDate: settlement.consignment.arrivalDate,
      },
      summary: {
        grossSales: decimalToNumber(settlement.grossSales),
        commissionAmount: decimalToNumber(settlement.commissionAmount),
        expenseAmount: decimalToNumber(settlement.expenseAmount),
        netPayable: decimalToNumber(settlement.netPayable),
        amountPaid: decimalToNumber(settlement.amountPaid),
        balanceAmount: decimalToNumber(settlement.balanceAmount),
        status: settlement.status,
      },
      notes: settlement.notes,
    }
  },
}
