import { getSessionUserId } from "@/lib/authHelpers";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// Update user wishlist
export async function POST(request) {
    try {
        const userId = getSessionUserId(request)
        const { wishlistItems } = await request.json()

        // Save the wishlist to the user object
        await prisma.user.update({
            where: { id: userId },
            data: { wishlist: wishlistItems }
        })
        return NextResponse.json({ message: "Wishlist Updated Successfully" })
    } catch (error) {
        console.error(error)
        return NextResponse.json({ error: error.code || error.message }, { status: 400 })
    }
}

// Get user wishlist
export async function GET(request) {
    try {
        const userId = getSessionUserId(request)
        
        // Find the user and get their wishlist
        const user = await prisma.user.findUnique({
            where: { id: userId }
        })

        return NextResponse.json({ wishlistItems: user.wishlist || {} })
    } catch (error) {
        console.error(error)
        return NextResponse.json({ error: error.code || error.message }, { status: 400 })
    }
}
