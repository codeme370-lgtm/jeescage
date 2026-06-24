import prisma from "@/lib/prisma";
import { getFallbackPayloadForRoute, isDatabaseUnavailableError } from "@/lib/prismaFallback.mjs";

export async function GET(req) {
    try {
        const videos = await prisma.product.findMany({
            where: {
                videoUrl: {
                    not: null,
                },
            },
            select: {
                id: true,
                name: true,
                videoUrl: true,
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        return Response.json(videos);
    } catch (error) {
        console.error("Error fetching videos:", error);
        if (isDatabaseUnavailableError(error)) {
            return Response.json(getFallbackPayloadForRoute("videos"), { status: 200 });
        }
        return Response.json(
            { error: "Failed to fetch videos" },
            { status: 500 }
        );
    }
}
