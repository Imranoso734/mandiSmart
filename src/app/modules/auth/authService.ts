import { UserRole } from "@prisma/client"
import { db } from "@/core/database"
import {
  AuthException,
  BadRequestException,
} from "@/core/entities/exceptions"
import { Password } from "@/core/helpers/password"
import { JWT } from "@/core/helpers/jwt"
import { authConfig } from "@/app/config"
import { slugify } from "../shared/utils"

type RegisterOwnerInput = {
  tenantName: string
  tenantSlug?: string
  tenantPhone?: string
  tenantAddress?: string
  ownerName: string
  ownerEmail: string
  ownerPhone?: string
  password: string
}

type LoginInput = {
  tenantSlug: string
  email: string
  password: string
}

export const AuthService = {
  /**
   * Yahan naya tenant aur uska owner account create hota hai.
   */
  async registerOwner(payload: RegisterOwnerInput) {
    await ensureStrongPassword(payload.password)

    const requestedSlug = payload.tenantSlug ? slugify(payload.tenantSlug) : slugify(payload.tenantName)
    if (!requestedSlug) {
      throw BadRequestException("tenant slug valid nahin hai")
    }

    const tenantExists = await db.tenant.findUnique({
      where: { slug: requestedSlug },
    })

    if (tenantExists) {
      throw BadRequestException("ye tenant slug pehle se mojood hai")
    }

    const passwordHash = await Password.hash(payload.password)

    const user = await db.$transaction(async (tx) => {
      const tenant = await tx.tenant.create({
        data: {
          name: payload.tenantName,
          slug: requestedSlug,
          phone: payload.tenantPhone,
          address: payload.tenantAddress,
          locale: "ur-PK",
          currency: "PKR",
        },
      })

      const owner = await tx.user.create({
        data: {
          tenantId: tenant.id,
          name: payload.ownerName,
          email: payload.ownerEmail.toLowerCase(),
          phone: payload.ownerPhone,
          role: UserRole.OWNER,
        },
        include: {
          tenant: true,
        },
      })

      await tx.password.create({
        data: {
          userId: owner.id,
          hash: passwordHash,
        },
      })

      return owner
    })

    const auth = await createAuthToken(user.id, user.tenantId, user.role)

    return {
      token: auth.token,
      expiry: auth.expiry,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      tenant: user.tenant,
    }
  },

  /**
   * Yahan tenant-specific login hota hai.
   */
  async login(payload: LoginInput) {
    const tenant = await db.tenant.findUnique({
      where: { slug: payload.tenantSlug },
    })

    if (!tenant || !tenant.isActive) {
      throw AuthException("tenant nahin mila")
    }

    const user = await db.user.findUnique({
      where: {
        tenantId_email: {
          tenantId: tenant.id,
          email: payload.email.toLowerCase(),
        },
      },
      include: {
        password: true,
      },
    })

    if (!user || !user.password || !user.isActive) {
      throw AuthException("email ya password ghalat hai")
    }

    const validPassword = await Password.verify(user.password.hash, payload.password)
    if (!validPassword) {
      throw AuthException("email ya password ghalat hai")
    }

    const auth = await createAuthToken(user.id, user.tenantId, user.role)

    return {
      token: auth.token,
      expiry: auth.expiry,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      tenant,
    }
  },

  /**
   * Yahan authenticated user ka profile milta hai.
   */
  async me(userId: number) {
    const user = await db.user.findUnique({
      where: { id: userId },
      include: { tenant: true },
    })

    if (!user) {
      throw AuthException("user nahin mila")
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      tenant: user.tenant,
    }
  },
}

async function createAuthToken(userId: number, tenantId: number, role: UserRole) {
  return JWT.generate(
    authConfig.jwt.secret,
    {
      scope: authConfig.tokens.auth.scope,
      userId,
      tenantId,
      userRole: role,
    },
    authConfig.tokens.auth.expiry,
  )
}

async function ensureStrongPassword(password: string): Promise<void> {
  const result = await Password.checkStrength(password)
  if (!result.strong) {
    throw BadRequestException(result.errors.join(", "))
  }
}
