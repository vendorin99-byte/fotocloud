import { google } from "googleapis";
import { prisma } from "@/lib/prisma";
import { refreshGoogleToken } from "@/lib/google/oauth";
import { deriveMimeType } from "@/lib/utils/drive-url";

const SUPPORTED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/heic",
  "image/heif",
  "video/mp4",
  "video/quicktime",
  "video/x-msvideo",
  "video/webm",
  "video/x-matroska",
];

async function getValidAccessToken(userId: string): Promise<string> {
  const user = await prisma.user.findUniqueOrThrow({
    where: { id: userId },
    select: {
      googleAccessToken: true,
      googleRefreshToken: true,
      googleTokenExpiry: true,
    },
  });

  if (!user.googleAccessToken || !user.googleRefreshToken) {
    throw new Error("Google Drive not connected");
  }

  const isExpired =
    !user.googleTokenExpiry || user.googleTokenExpiry <= new Date();

  if (isExpired) {
    const refreshed = await refreshGoogleToken(user.googleRefreshToken);
    await prisma.user.update({
      where: { id: userId },
      data: {
        googleAccessToken: refreshed.accessToken,
        googleTokenExpiry: refreshed.expiresAt,
      },
    });
    return refreshed.accessToken;
  }

  return user.googleAccessToken;
}

export interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  thumbnailLink?: string;
  webViewLink?: string;
  size?: string;
  imageMediaMetadata?: { width?: number; height?: number };
  videoMediaMetadata?: { durationMillis?: string; width?: number; height?: number };
  createdTime?: string;
}

export async function listFilesInFolder(
  userId: string,
  folderId: string
): Promise<DriveFile[]> {
  const accessToken = await getValidAccessToken(userId);

  const auth = new google.auth.OAuth2();
  auth.setCredentials({ access_token: accessToken });

  const drive = google.drive({ version: "v3", auth });

  const files: DriveFile[] = [];
  let pageToken: string | undefined;

  do {
    const res = await drive.files.list({
      q: `'${folderId}' in parents and trashed=false and (${SUPPORTED_MIME_TYPES.map((m) => `mimeType='${m}'`).join(" or ")})`,
      fields:
        "nextPageToken, files(id, name, mimeType, thumbnailLink, webViewLink, size, imageMediaMetadata, videoMediaMetadata, createdTime)",
      pageSize: 100,
      ...(pageToken ? { pageToken } : {}),
    });

    const batch = (res.data.files ?? []) as DriveFile[];
    files.push(...batch);
    pageToken = res.data.nextPageToken ?? undefined;
  } while (pageToken);

  return files;
}

export async function syncProjectMedia(
  userId: string,
  projectId: string
): Promise<{ added: number; removed: number }> {
  const project = await prisma.project.findFirst({
    where: { id: projectId, photographerId: userId },
    select: { driveFolderId: true },
  });

  if (!project?.driveFolderId) {
    throw new Error("Drive folder not linked to this project");
  }

  await prisma.project.update({
    where: { id: projectId },
    data: { syncStatus: "syncing" },
  });

  try {
    const driveFiles = await listFilesInFolder(userId, project.driveFolderId);
    const driveFileIds = new Set(driveFiles.map((f) => f.id));

    let added = 0;

    for (const file of driveFiles) {
      const type = deriveMimeType(file.mimeType);
      const meta = file.imageMediaMetadata;
      const videoMeta = file.videoMediaMetadata;

      const existing = await prisma.mediaItem.findUnique({
        where: { projectId_driveFileId: { projectId, driveFileId: file.id } },
      });

      if (!existing) {
        await prisma.mediaItem.create({
          data: {
            driveFileId: file.id,
            name: file.name,
            mimeType: file.mimeType,
            type,
            thumbnailUrl: file.thumbnailLink ?? null,
            webViewUrl: file.webViewLink ?? null,
            downloadUrl: `https://drive.google.com/uc?export=download&id=${file.id}`,
            fileSize: file.size ? BigInt(file.size) : null,
            width: meta?.width ?? videoMeta?.width ?? null,
            height: meta?.height ?? videoMeta?.height ?? null,
            durationSecs: videoMeta?.durationMillis
              ? Math.floor(Number(videoMeta.durationMillis) / 1000)
              : null,
            takenAt: file.createdTime ? new Date(file.createdTime) : null,
            projectId,
          },
        });
        added++;
      } else {
        // Refresh thumbnail URL (Drive thumbnails expire)
        await prisma.mediaItem.update({
          where: { id: existing.id },
          data: { thumbnailUrl: file.thumbnailLink ?? null },
        });
      }
    }

    // Mark items no longer in Drive
    const removed = await prisma.mediaItem.deleteMany({
      where: {
        projectId,
        driveFileId: { notIn: Array.from(driveFileIds) },
      },
    });

    await prisma.project.update({
      where: { id: projectId },
      data: { syncStatus: "synced", lastSyncedAt: new Date() },
    });

    return { added, removed: removed.count };
  } catch (err) {
    await prisma.project.update({
      where: { id: projectId },
      data: { syncStatus: "error" },
    });
    throw err;
  }
}
