import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { GalleryClient } from "@/components/gallery/GalleryClient";
import type { GalleryData } from "@/lib/gallery/token";

async function getGalleryBySlug(slug: string): Promise<(GalleryData & { tokenValue: string }) | null> {
  const accessToken = await prisma.accessToken.findUnique({
    where: { slug },
    include: {
      project: {
        select: { id: true, name: true, clientName: true, description: true },
      },
    },
  });

  if (!accessToken?.isActive) return null;
  if (accessToken.expiresAt && accessToken.expiresAt < new Date()) return null;

  const mediaItems = await prisma.mediaItem.findMany({
    where: { projectId: accessToken.projectId, isHidden: false },
    orderBy: [{ sortOrder: "asc" }, { takenAt: "asc" }, { createdAt: "asc" }],
    include: {
      reviews: { where: { accessTokenId: accessToken.id }, take: 1 },
      comments: {
        where: { accessTokenId: accessToken.id },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  return {
    tokenValue: accessToken.token,
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
        ? { status: item.reviews[0].status, revisionNote: item.reviews[0].revisionNote }
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

export default async function SlugGalleryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const gallery = await getGalleryBySlug(slug);

  if (!gallery) notFound();

  return <GalleryClient gallery={gallery} token={gallery.tokenValue} />;
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const token = await prisma.accessToken.findUnique({
    where: { slug },
    include: { project: { select: { name: true, clientName: true } } },
  });
  if (!token) return { title: "Galeri — FotoCloud" };
  return {
    title: `${token.project.name}${token.project.clientName ? ` · ${token.project.clientName}` : ""} — FotoCloud`,
  };
}
