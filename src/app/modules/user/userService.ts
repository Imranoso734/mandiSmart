import { Prisma, UserRole } from "@prisma/client"
import { db } from "@/core/database"
import { BadRequestException, NotFoundException } from "@/core/entities/exceptions"
import { Password } from "@/core/helpers/password"
import { normalizePhone, normalizePhoneSearch } from "../shared/phone"
import { paginate } from "../shared/utils"

type ListUsersQuery = {
  page: number
  limit: number
  search?: string
  role?: UserRole
}

type CreateUserInput = {
  name: string
  email: string
  phone?: string
  role: UserRole
  password: string
}

type UpdateUserInput = Partial<CreateUserInput> & {
  isActive?: boolean
}

export const UserService = {
  /**
   * Yahan tenant ke tamam users list hote hain.
   */
  async list(tenantId: number, query: ListUsersQuery) {
    const phoneSearch = normalizePhoneSearch(query.search)
    const where: Prisma.UserWhereInput = {
      tenantId,
      ...(query.role ? { role: query.role } : {}),
      ...(query.search
        ? {
            OR: [
              { name: { contains: query.search, mode: "insensitive" } },
              { email: { contains: query.search, mode: "insensitive" } },
              { phone: { contains: query.search, mode: "insensitive" } },
              ...(phoneSearch ? [{ phone: { contains: phoneSearch, mode: "insensitive" as const } }] : []),
            ],
          }
        : {}),
    }

    const [count, data] = await db.$transaction([
      db.user.count({ where }),
      db.user.findMany({
        where,
        orderBy: { createdAt: "desc" },
        ...paginate(query.page, query.limit),
      }),
    ])

    return {
      total: count,
      page: query.page,
      limit: query.limit,
      data,
    }
  },

  /**
   * Yahan ek user ki detail milti hai.
   */
  async getById(tenantId: number, id: number) {
    const user = await db.user.findFirst({
      where: { id, tenantId },
    })

    if (!user) {
      throw NotFoundException("user nahin mila")
    }

    return user
  },

  /**
   * Yahan owner tenant ke andar naya user banata hai.
   */
  async create(tenantId: number, createdById: number, payload: CreateUserInput) {
    const existing = await db.user.findUnique({
      where: {
        tenantId_email: {
          tenantId,
          email: payload.email.toLowerCase(),
        },
      },
    })

    if (existing) {
      throw BadRequestException("ye email is tenant mein pehle se mojood hai")
    }

    const passwordHash = await Password.hash(payload.password)

    return db.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          tenantId,
          createdById,
          name: payload.name,
          email: payload.email.toLowerCase(),
          phone: normalizePhone(payload.phone),
          role: payload.role,
        },
      })

      await tx.password.create({
        data: {
          userId: user.id,
          hash: passwordHash,
        },
      })

      return user
    })
  },

  /**
   * Yahan user update hota hai, aur password optional hai.
   */
  async update(tenantId: number, id: number, payload: UpdateUserInput) {
    const user = await db.user.findFirst({ where: { id, tenantId } })
    if (!user) {
      throw NotFoundException("user nahin mila")
    }

    const data: Prisma.UserUpdateInput = {
      ...(payload.name !== undefined ? { name: payload.name } : {}),
      ...(payload.phone !== undefined ? { phone: normalizePhone(payload.phone) } : {}),
      ...(payload.role !== undefined ? { role: payload.role } : {}),
      ...(payload.isActive !== undefined ? { isActive: payload.isActive } : {}),
    }

    const updated = await db.user.update({
      where: { id },
      data,
    })

    if (payload.password) {
      const passwordHash = await Password.hash(payload.password)
      await db.password.upsert({
        where: { userId: id },
        update: { hash: passwordHash },
        create: { userId: id, hash: passwordHash },
      })
    }

    return updated
  },

  /**
   * Yahan user ko soft-delete ki jagah inactive mark karte hain.
   */
  async remove(tenantId: number, id: number) {
    const user = await db.user.findFirst({ where: { id, tenantId } })
    if (!user) {
      throw NotFoundException("user nahin mila")
    }

    if (user.role === UserRole.OWNER) {
      throw BadRequestException("owner user delete nahin ho sakta")
    }

    return db.user.update({
      where: { id },
      data: { isActive: false },
    })
  },
}
