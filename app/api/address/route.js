
import prisma from "@/lib/prisma"
import { getAuth } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"

//add new address

export async function POST(request){
    try {
        const {userId}=getAuth(request)
        if(!userId){
            return NextResponse.json({error: 'Not authenticated'}, {status: 401})
        }

        const address = await request.json()
        if(!address || Object.keys(address).length === 0){
            return NextResponse.json({error: 'Missing address data'}, {status: 400})
        }

        //attach userId and create address
        address.userId = userId
        const newAddress = await prisma.address.create({
            data: address
        })

        return NextResponse.json({newAddress,message: "Address Added Successfully"})
    } catch (error) {
        console.error(error)
        return NextResponse.json({error:error.code || error.message}, {status:400})
    }
}


//get all address for a user
export async function GET(request){
    try {
        const {userId}=getAuth(request)
        if(!userId){
            return NextResponse.json({error: 'Not authenticated'}, {status: 401})
        }

        const addresses = await prisma.address.findMany({
            where: {userId}
        })

        return NextResponse.json({addresses})
    } catch (error) {
        console.error(error)
        return NextResponse.json({error:error.code || error.message}, {status:400})
    }
}