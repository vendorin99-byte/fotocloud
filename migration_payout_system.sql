-- Migration: Add photographer balance & payout system

-- Create PhotographerBalance table
CREATE TABLE IF NOT EXISTS "PhotographerBalance" (
  id TEXT PRIMARY KEY,
  "photographerId" TEXT NOT NULL UNIQUE,
  balance INTEGER NOT NULL DEFAULT 0,
  "totalEarned" INTEGER NOT NULL DEFAULT 0,
  "totalPaidOut" INTEGER NOT NULL DEFAULT 0,
  "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  CONSTRAINT fk_photographer FOREIGN KEY ("photographerId")
    REFERENCES "User"(id) ON DELETE CASCADE
);

-- Create PayoutRequest table FIRST (before Transaction references it)
CREATE TABLE IF NOT EXISTS "PayoutRequest" (
  id TEXT PRIMARY KEY,
  "photographerId" TEXT NOT NULL,
  amount INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  "bankName" TEXT,
  "bankAccount" TEXT,
  "accountHolder" TEXT,
  "approvedAt" TIMESTAMP,
  "rejectedAt" TIMESTAMP,
  "completedAt" TIMESTAMP,
  "rejectionReason" TEXT,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  CONSTRAINT fk_photographer_payout FOREIGN KEY ("photographerId")
    REFERENCES "User"(id) ON DELETE CASCADE
);

-- Create Transaction table (after PayoutRequest exists)
CREATE TABLE IF NOT EXISTS "Transaction" (
  id TEXT PRIMARY KEY,
  "photographerId" TEXT NOT NULL,
  type TEXT NOT NULL,
  amount INTEGER NOT NULL,
  description TEXT,
  "purchaseId" TEXT,
  "payoutRequestId" TEXT,
  status TEXT NOT NULL DEFAULT 'completed',
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  CONSTRAINT fk_photographer_txn FOREIGN KEY ("photographerId")
    REFERENCES "User"(id) ON DELETE CASCADE,
  CONSTRAINT fk_purchase FOREIGN KEY ("purchaseId")
    REFERENCES "Purchase"(id) ON DELETE SET NULL,
  CONSTRAINT fk_payout_request FOREIGN KEY ("payoutRequestId")
    REFERENCES "PayoutRequest"(id) ON DELETE SET NULL
);

-- Create CommissionConfig table
CREATE TABLE IF NOT EXISTS "CommissionConfig" (
  id TEXT PRIMARY KEY,
  "photographerPercent" INTEGER NOT NULL DEFAULT 80,
  "platformPercent" INTEGER NOT NULL DEFAULT 20,
  "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Insert default commission config
INSERT INTO "CommissionConfig" (id, "photographerPercent", "platformPercent")
VALUES ('default', 80, 20)
ON CONFLICT (id) DO NOTHING;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_transaction_photographer
  ON "Transaction"("photographerId");
CREATE INDEX IF NOT EXISTS idx_transaction_type
  ON "Transaction"(type);
CREATE INDEX IF NOT EXISTS idx_transaction_status
  ON "Transaction"(status);
CREATE INDEX IF NOT EXISTS idx_transaction_created
  ON "Transaction"("createdAt");

CREATE INDEX IF NOT EXISTS idx_payout_request_photographer
  ON "PayoutRequest"("photographerId");
CREATE INDEX IF NOT EXISTS idx_payout_request_status
  ON "PayoutRequest"(status);
CREATE INDEX IF NOT EXISTS idx_payout_request_created
  ON "PayoutRequest"("createdAt");

CREATE INDEX IF NOT EXISTS idx_balance_photographer
  ON "PhotographerBalance"("photographerId");

-- Update Purchase table to add transactions relation (optional - if not using foreign key)
-- ALTER TABLE "Purchase" ADD COLUMN transactions_id TEXT;
-- This is handled by Prisma relation, so no change needed here
