import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

//add new rating

export async function POST(request) {
    try {
        const {userId} = getAuth(request)
        //we need data from the request body
        const {orderId, productId, rating, review} = await request.json()
        //get the other data
        const order = await prisma.order.findUnique({ where: { id: orderId } })
        //suppose order is not found or doesn't belong to user
        if(!order || order.userId !== userId){
            return NextResponse.json({error: "Order not found"}, {status: 404})
        }
        //suppose order is found, check if the product is already rated
        const isAlreadyRated = await prisma.rating.findFirst({
            where: {
                orderId: orderId,
                productId: productId
            }
        })

        //suppose already rated
        if(isAlreadyRated){
            return NextResponse.json({error: "You have already rated this product"}, {status: 400})
        }

        //suppose not rated, create a new rating
        const response = await prisma.rating.create({
            data: {
                userId: userId,
                orderId: orderId,
                productId: productId,
                rating: rating,
                review: review
            }
        })
        return NextResponse.json({message: "Rating added successfully", rating: response}, {status: 201})
    } catch (error) {
        console.error(error)
        return NextResponse.json({error: error.message}, {status: 400})
    }
}

//Get ratings for a user
export async function GET(request) {
    try {
        const {userId} = getAuth(request)
        //suppose userid is not available
        if(!userId){
            return NextResponse.json({error: "Unauthorized"}, {status: 401})
        }
        //suppose userid is available, fetch ratings
        const ratings = await prisma.rating.findMany({
            where: {userId: userId},
            include: {
                product: true,}
            }
        )
        return NextResponse.json({ratings}, {status: 200})
    } catch (error) {
        console.error(error)
        return NextResponse.json({error: error.message}, {status: 400})
    }
}