import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import PhotoPricingClient from '@/components/photos/PhotoPricingClient';
import { PhotoUploadSection } from '@/components/photos/PhotoUploadSection';

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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Kelola Harga Foto</h1>
        <p className="text-gray-600 mt-1">Set harga untuk menjual foto Anda di marketplace</p>
      </div>

      <PhotoUploadSection />
      <PhotoPricingClient photos={allPhotos} />
    </div>
  );
}
