-- Migration: Make driveFileId optional in MediaItem

-- Drop the existing unique constraint
ALTER TABLE "MediaItem" DROP CONSTRAINT "MediaItem_projectId_driveFileId_key";

-- Make driveFileId nullable
ALTER TABLE "MediaItem" ALTER COLUMN "driveFileId" DROP NOT NULL;

-- No need for partial unique constraint - app logic handles this
