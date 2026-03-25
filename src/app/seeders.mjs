import { PrismaClient, UserRole } from "@prisma/client"
import argon2 from "argon2"

const prisma = new PrismaClient()

function slugify(value) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

async function main() {
  const tenantName = process.env.SEED_TENANT_NAME || "MandiSmart Demo"
  const ownerEmail = process.env.ADMIN_EMAIL || "owner@mandismart.local"
  const ownerPassword = process.env.ADMIN_PASSWORD || "ChangeMe123!"
  const ownerName = process.env.SEED_OWNER_NAME || "مالک"
  const tenantSlug = process.env.SEED_TENANT_SLUG || slugify(tenantName)

  const tenant = await prisma.tenant.upsert({
    where: { slug: tenantSlug },
    update: {
      name: tenantName,
      locale: "ur-PK",
      currency: "PKR",
    },
    create: {
      name: tenantName,
      slug: tenantSlug,
      locale: "ur-PK",
      currency: "PKR",
    },
  })

  const passwordHash = await argon2.hash(ownerPassword)

  const owner = await prisma.user.upsert({
    where: {
      tenantId_email: {
        tenantId: tenant.id,
        email: ownerEmail,
      },
    },
    update: {
      name: ownerName,
      role: UserRole.OWNER,
      isActive: true,
    },
    create: {
      tenantId: tenant.id,
      name: ownerName,
      email: ownerEmail,
      role: UserRole.OWNER,
    },
  })

  await prisma.password.upsert({
    where: { userId: owner.id },
    update: { hash: passwordHash },
    create: { userId: owner.id, hash: passwordHash },
  })

  console.log(`Seed complete for tenant ${tenant.slug}`)
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
