-- Add watermark toggle to Project
ALTER TABLE "Project" ADD COLUMN IF NOT EXISTS "watermarkEnabled" BOOLEAN NOT NULL DEFAULT false;

-- GalleryView table for analytics
CREATE TABLE IF NOT EXISTS "GalleryView" (
  "id" TEXT NOT NULL,
  "projectId" TEXT NOT NULL,
  "accessTokenId" TEXT,
  "viewedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "GalleryView_pkey" PRIMARY KEY ("id")
);
ALTER TABLE "GalleryView" ADD CONSTRAINT IF NOT EXISTS "GalleryView_projectId_fkey"
  FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Testimonial table
CREATE TABLE IF NOT EXISTS "Testimonial" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "role" TEXT,
  "content" TEXT NOT NULL,
  "rating" INTEGER NOT NULL DEFAULT 5,
  "isVisible" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Testimonial_pkey" PRIMARY KEY ("id")
);

-- AppSettings table
CREATE TABLE IF NOT EXISTS "AppSettings" (
  "id" TEXT NOT NULL DEFAULT 'default',
  "proMonthlyPrice" INTEGER NOT NULL DEFAULT 99000,
  "proYearlyPrice" INTEGER NOT NULL DEFAULT 899000,
  "freeProjectLimit" INTEGER NOT NULL DEFAULT 1,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT NOW(),
  CONSTRAINT "AppSettings_pkey" PRIMARY KEY ("id")
);

-- Insert default settings
INSERT INTO "AppSettings" ("id", "updatedAt") VALUES ('default', NOW()) ON CONFLICT DO NOTHING;
