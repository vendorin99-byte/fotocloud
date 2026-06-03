import { prisma } from "@/lib/prisma";
import { deriveMimeType } from "@/lib/utils/drive-url";

const DRIVE_API = "https://www.googleapis.com/drive/v3";
const API_KEY = process.env.GOOGLE_API_KEY!;

const SUPPORTED_MIME = [
  "image/jpeg", "image/png", "image/webp", "image/gif", "image/heic", "image/heif",
  "video/mp4", "video/quicktime", "video/x-msvideo", "video/webm", "video/x-matroska",
];

export interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  size?: string;
  imageMediaMetadata?: { width?: number; height?: number };
  videoMediaMetadata?: { durationMillis?: string; width?: number; height?: number };
  createdTime?: string;
}

/** List all supported media files in a public Drive folder using API key */
export async function listFilesInFolder(folderId: string): Promise<DriveFile[]> {
  const files: DriveFile[] = [];
  let pageToken: string | undefined;

  const mimeFilter = SUPPORTED_MIME.map((m) => `mimeType='${m}'`).join(" or ");

  do {
    const params = new URLSearchParams({
      key: API_KEY,
      q: `'${folderId}' in parents and trashed=false and (${mimeFilter})`,
      fields: "nextPageToken, files(id, name, mimeType, size, imageMediaMetadata, videoMediaMetadata, createdTime)",
      pageSize: "100",
      ...(pageToken ? { pageToken } : {}),
    });

    const res = await fetch(`${DRIVE_API}/files?${params}`);

    if (!res.ok) {
      const err = await res.json();
      const msg = err?.error?.message ?? "Drive API error";
      // Provide clear error if folder is not public
      if (res.status === 403 || res.status === 404) {
        throw new Error(
          `Folder tidak bisa diakses. Pastikan folder Drive sudah di-set ke "Anyone with the link can view". (${msg})`
        );
      }
      throw new Error(msg);
    }

    const data = await res.json();
    files.push(...(data.files ?? []));
    pageToken = data.nextPageToken;
  } while (pageToken);

  return files;
}

/** Build a stable public thumbnail URL for a Drive file */
export function buildThumbnailUrl(fileId: string, size = 800): string {
  return `https://drive.google.com/thumbnail?id=${fileId}&sz=w${size}`;
}

/** Build a direct image/video URL for embedding (works for public files) */
export function buildWebViewUrl(fileId: string): string {
  // lh3.googleusercontent.com/d/ serves the actual file content directly
  return `https://lh3.googleusercontent.com/d/${fileId}`;
}

/** Build a large preview URL for lightbox display */
export function buildLargePreviewUrl(fileId: string): string {
  return `https://drive.google.com/thumbnail?id=${fileId}&sz=w1920`;
}

/** Build a public download URL for a Drive file */
export function buildDownloadUrl(fileId: string): string {
  return `https://drive.google.com/uc?export=download&id=${fileId}`;
}

export async function syncProjectMedia(
  projectId: string
): Promise<{ added: number; removed: number }> {
  const project = await prisma.project.findFirst({
    where: { id: projectId },
    select: { driveFolderId: true, photographerId: true },
  });

  if (!project?.driveFolderId) {
    throw new Error("Drive folder belum dihubungkan ke project ini");
  }

  await prisma.project.update({
    where: { id: projectId },
    data: { syncStatus: "syncing" },
  });

  try {
    const driveFiles = await listFilesInFolder(project.driveFolderId);
    const driveFileIds = new Set(driveFiles.map((f) => f.id));
    let added = 0;

    for (const file of driveFiles) {
      const type = deriveMimeType(file.mimeType);
      const imgMeta = file.imageMediaMetadata;
      const vidMeta = file.videoMediaMetadata;

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
            thumbnailUrl: buildThumbnailUrl(file.id),
            webViewUrl: buildWebViewUrl(file.id),
            downloadUrl: buildDownloadUrl(file.id),
            fileSize: file.size ? BigInt(file.size) : null,
            width: imgMeta?.width ?? vidMeta?.width ?? null,
            height: imgMeta?.height ?? vidMeta?.height ?? null,
            durationSecs: vidMeta?.durationMillis
              ? Math.floor(Number(vidMeta.durationMillis) / 1000)
              : null,
            takenAt: file.createdTime ? new Date(file.createdTime) : null,
            projectId,
          },
        });
        added++;
      }
      // Thumbnail URL is stable (no expiry) so no refresh needed
    }

    // Remove items no longer in Drive
    const removed = await prisma.mediaItem.deleteMany({
      where: { projectId, driveFileId: { notIn: Array.from(driveFileIds) } },
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
