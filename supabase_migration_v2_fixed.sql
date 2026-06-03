-- 1. Add watermark toggle to Project
ALTER TABLE "Project" ADD COLUMN IF NOT EXISTS "watermarkEnabled" BOOLEAN NOT NULL DEFAULT false;

-- 2. GalleryView table for analytics
CREATE TABLE IF NOT EXISTS "GalleryView" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "projectId" TEXT NOT NULL REFERENCES "Project"("id") ON DELETE CASCADE,
  "accessTokenId" TEXT,
  "viewedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 3. Testimonial table
CREATE TABLE IF NOT EXISTS "Testimonial" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "name" TEXT NOT NULL,
  "role" TEXT,
  "content" TEXT NOT NULL,
  "rating" INTEGER NOT NULL DEFAULT 5,
  "isVisible" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 4. AppSettings table
CREATE TABLE IF NOT EXISTS "AppSettings" (
  "id" TEXT NOT NULL PRIMARY KEY DEFAULT 'default',
  "proMonthlyPrice" INTEGER NOT NULL DEFAULT 99000,
  "proYearlyPrice" INTEGER NOT NULL DEFAULT 899000,
  "freeProjectLimit" INTEGER NOT NULL DEFAULT 1,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT NOW()
);

-- 5. Insert default settings (if not exists)
INSERT INTO "AppSettings" ("id", "updatedAt")
VALUES ('default', NOW())
ON CONFLICT ("id") DO NOTHING;
