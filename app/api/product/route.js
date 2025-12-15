import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"




//function to get all products of a seller
export async function GET(request) {
    try {
        //let's get all products from the database
        let products = await prisma.product.findMany({
            where: {
                inStock: true},
            include:{
              rating :{
                select:{
                    createdAt:true, rating:true,
                     review:true, user: {select:{name:true, image:true}
                    }
                }
              },
              store:true
            },
            orderBy: {createdAt: 'desc'}
            })

            // remove product if the store is inactive
            products = products.filter(product => product.store.isActive)
            //return a response
            return NextResponse.json({products})
    }catch (error) {
        console.error(error)
        return NextResponse.json({ error:error.code || error.message }, { status: 500 })
    }
}