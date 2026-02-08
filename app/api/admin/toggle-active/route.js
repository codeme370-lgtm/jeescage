import {getAuth} from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import authAdmin from '@/middlewares/authAdmin'
import prisma from '@/lib/prisma'

//Toggle store active status
export async function POST(request) {
    try {
        //let's get the user 
        const {userId}=getAuth(request)
        const isAdmin= await authAdmin(userId)

        if(!isAdmin){
           return NextResponse.json({error:'Unauthorized Access'}, {status:403}) 
        }

        const {storeId} = await request.json()

        if(!storeId){
            return NextResponse.json({error: 'Store ID is required'}, {status: 400})
        }

        //get the store
        const store = await prisma.store.findUnique({
            where: { id: storeId }
        })

        if(!store){
            return NextResponse.json({error: 'Store not found'}, {status: 404})
        }

        //toggle the active status
        const updatedStore = await prisma.store.update({
            where: { id: storeId },
            data: { isActive: !store.isActive }
        })

        return NextResponse.json({message: 'Store status updated', store: updatedStore}, {status: 200})
    } catch (error) {
        console.error(error)
        return NextResponse.json({error: error.message}, {status: 500})
    }
}
