import { getGalleryByToken } from "@/lib/gallery/token";
import { notFound } from "next/navigation";
import { GalleryClient } from "@/components/gallery/GalleryClient";

export default async function GalleryPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const gallery = await getGalleryByToken(token);

  if (!gallery) {
    notFound();
  }

  return <GalleryClient gallery={gallery} token={token} />;
}

export function generateMetadata() {
  return { title: "Galeri Foto — FotoCloud" };
}
