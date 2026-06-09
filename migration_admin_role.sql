-- Migration: Add isAdmin role to User table

ALTER TABLE "User"
ADD COLUMN "isAdmin" BOOLEAN NOT NULL DEFAULT false;

-- Optional: Set your user as admin (replace with your actual user ID)
-- UPDATE "User" SET "isAdmin" = true WHERE email = 'your-email@example.com';

-- Create index for admin queries
CREATE INDEX IF NOT EXISTS idx_user_is_admin
  ON "User"("isAdmin");
