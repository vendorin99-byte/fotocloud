/**
 * Extract Google Drive folder ID from any valid folder URL format.
 * Supported formats:
 *   https://drive.google.com/drive/folders/FOLDER_ID
 *   https://drive.google.com/drive/u/0/folders/FOLDER_ID
 *   https://drive.google.com/drive/folders/FOLDER_ID?usp=sharing
 */
export function extractDriveFolderId(url: string): string | null {
  const match = url.match(/\/folders\/([a-zA-Z0-9_-]+)/);
  return match ? match[1] : null;
}

export function isValidDriveFolderUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return (
      parsed.hostname === "drive.google.com" &&
      /\/folders\/[a-zA-Z0-9_-]+/.test(parsed.pathname)
    );
  } catch {
    return false;
  }
}

export function buildDriveDownloadUrl(fileId: string): string {
  return `https://drive.google.com/uc?export=download&id=${fileId}`;
}

export function deriveMimeType(mimeType: string): "photo" | "video" | "other" {
  if (mimeType.startsWith("image/")) return "photo";
  if (mimeType.startsWith("video/")) return "video";
  return "other";
}
