import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const category = searchParams.get("category");
    const photographerId = searchParams.get("photographerId");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = 12;
    const skip = (page - 1) * limit;

    // Build filter - only photos marked for sale
    const where: any = {
      isHidden: false,
      isForSale: true,
      price: {
        gt: 0,
      },
    };

    // Add category filter if provided
    if (category) {
      where.category = category;
    }

    // Add photographer filter if provided
    if (photographerId) {
      where.project = {
        photographerId,
      };
    }

    // Get photos
    const photos = await prisma.mediaItem.findMany({
      where,
      include: {
        project: {
          select: {
            id: true,
            name: true,
            photographer: {
              select: {
                id: true,
                name: true,
                businessName: true,
              },
            },
          },
        },
        photoReviews: {
          select: {
            rating: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    });

    // Get total count
    const total = await prisma.mediaItem.count({ where });

    // Calculate average rating and sanitize BigInt
    const photosWithRating = photos.map((photo) => {
      const avgRating =
        photo.photoReviews.length > 0
          ? photo.photoReviews.reduce((sum, r) => sum + r.rating, 0) /
            photo.photoReviews.length
          : null;

      return {
        id: photo.id,
        name: photo.name,
        displayName: photo.displayName,
        price: photo.price,
        thumbnailUrl: photo.thumbnailUrl,
        category: photo.category,
        averageRating: avgRating,
        reviewCount: photo.photoReviews.length,
        project: photo.project,
      };
    });

    return NextResponse.json({
      photos: photosWithRating,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (err) {
    console.error("Marketplace error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
