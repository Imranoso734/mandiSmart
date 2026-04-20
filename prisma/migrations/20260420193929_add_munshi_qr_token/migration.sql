-- CreateTable
CREATE TABLE "MunshiQrToken" (
    "id" SERIAL NOT NULL,
    "token" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "tenantId" INTEGER NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MunshiQrToken_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MunshiQrToken_token_key" ON "MunshiQrToken"("token");

-- CreateIndex
CREATE INDEX "MunshiQrToken_token_idx" ON "MunshiQrToken"("token");

-- CreateIndex
CREATE INDEX "MunshiQrToken_userId_tenantId_idx" ON "MunshiQrToken"("userId", "tenantId");

-- AddForeignKey
ALTER TABLE "MunshiQrToken" ADD CONSTRAINT "MunshiQrToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MunshiQrToken" ADD CONSTRAINT "MunshiQrToken_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
