import prisma from "@/lib/prisma";

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
        return Response.json(
            { error: "Failed to fetch videos" },
            { status: 500 }
        );
    }
}
