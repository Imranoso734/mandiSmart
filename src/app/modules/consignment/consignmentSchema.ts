import { CommissionType, ConsignmentStatus } from "@prisma/client"
import { z } from "zod"
import { paginationSchema } from "../shared/schema"

const consignmentItemSchema = z.object({
  productNameUrdu: z.string().trim().min(1),
  productNameRoman: z.string().trim().optional(),
  unit: z.string().trim().min(1).default("kg"),
  quantityReceived: z.coerce.number().positive(),
  baseRate: z.coerce.number().nonnegative().optional(),
})

export const listConsignmentQuerySchema = paginationSchema.extend({
  supplierId: z.coerce.number().int().positive().optional(),
  status: z.nativeEnum(ConsignmentStatus).optional(),
})

export const createConsignmentSchema = z.object({
  supplierId: z.coerce.number().int().positive(),
  vehicleNumber: z.string().trim().min(2),
  driverName: z.string().trim().optional(),
  driverPhone: z.string().trim().optional(),
  arrivalDate: z.coerce.date(),
  notes: z.string().trim().optional(),
  commissionType: z.nativeEnum(CommissionType).default(CommissionType.PERCENTAGE),
  commissionValue: z.coerce.number().nonnegative(),
  items: z.array(consignmentItemSchema).min(1),
})

export const updateConsignmentSchema = createConsignmentSchema.partial()

export const closeConsignmentSchema = z.object({
  notes: z.string().trim().optional(),
})
