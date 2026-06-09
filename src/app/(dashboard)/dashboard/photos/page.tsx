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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Kelola Harga Foto</h1>
        <p className="text-gray-600 mt-1">Set harga untuk menjual foto Anda di marketplace</p>
      </div>

      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Kelola Harga Foto</h2>
        <Link
          href="/dashboard/photos/upload"
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          <Plus size={18} /> Upload Foto Baru
        </Link>
      </div>
      <PhotoPricingClient photos={allPhotos} />
    </div>
  );
}
