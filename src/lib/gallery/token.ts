import { prisma } from "@/lib/prisma";

export type GalleryData = {
  project: {
    id: string;
    name: string;
    clientName: string | null;
    description: string | null;
  };
  token: {
    id: string;
    label: string | null;
    canDownload: boolean;
    canComment: boolean;
  };
  mediaItems: Array<{
    id: string;
    name: string;
    mimeType: string;
    type: string;
    thumbnailUrl: string | null;
    webViewUrl: string | null;
    width: number | null;
    height: number | null;
    durationSecs: number | null;
    sortOrder: number;
    review: { status: string; revisionNote: string | null } | null;
    comments: Array<{
      id: string;
      authorName: string;
      body: string;
      timestampSecs: number | null;
      createdAt: Date;
    }>;
  }>;
};

export async function getGalleryByToken(
  tokenValue: string
): Promise<GalleryData | null> {
  const accessToken = await prisma.accessToken.findUnique({
    where: { token: tokenValue },
    include: {
      project: {
        select: { id: true, name: true, clientName: true, description: true },
      },
    },
  });

  if (!accessToken) return null;
  if (!accessToken.isActive) return null;
  if (accessToken.expiresAt && accessToken.expiresAt < new Date()) return null;

  const mediaItems = await prisma.mediaItem.findMany({
    where: { projectId: accessToken.projectId, isHidden: false },
    orderBy: [{ sortOrder: "asc" }, { takenAt: "asc" }, { createdAt: "asc" }],
    include: {
      reviews: {
        where: { accessTokenId: accessToken.id },
        take: 1,
      },
      comments: {
        where: { accessTokenId: accessToken.id },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  return {
    project: accessToken.project,
    token: {
      id: accessToken.id,
      label: accessToken.label,
      canDownload: accessToken.canDownload,
      canComment: accessToken.canComment,
    },
    mediaItems: mediaItems.map((item: typeof mediaItems[number]) => ({
      id: item.id,
      name: item.name,
      mimeType: item.mimeType,
      type: item.type,
      thumbnailUrl: item.thumbnailUrl,
      webViewUrl: item.webViewUrl,
      width: item.width,
      height: item.height,
      durationSecs: item.durationSecs,
      sortOrder: item.sortOrder,
      review: item.reviews[0]
        ? {
            status: item.reviews[0].status,
            revisionNote: item.reviews[0].revisionNote,
          }
        : null,
      comments: item.comments.map((c: typeof item.comments[number]) => ({
        id: c.id,
        authorName: c.authorName,
        body: c.body,
        timestampSecs: c.timestampSecs,
        createdAt: c.createdAt,
      })),
    })),
  };
}
