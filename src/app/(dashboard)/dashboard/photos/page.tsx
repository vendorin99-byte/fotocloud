import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import PhotoPricingClient from '@/components/photos/PhotoPricingClient';

export default async function PhotosPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect('/login');

  // Get all photos for this photographer
  const projects = await prisma.project.findMany({
    where: { photographerId: session.user.id },
    include: {
      mediaItems: {
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  // Flatten to get all photos
  const allPhotos = projects.flatMap((project) =>
    project.mediaItems.map((item) => ({
      ...item,
      projectName: project.name,
    }))
  );

  return <PhotoPricingClient photos={allPhotos} />;
}
