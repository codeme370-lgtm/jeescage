import {NextResponse} from 'next/server'
import { getSessionUserId } from "@/lib/authHelpers";
import authAdmin from '@/middlewares/authAdmin'
import prisma from '@/lib/prisma'


// toggle store active status
export async function POST(request) {
    try {
        //let's get our user
        const userId = getSessionUserId(request)
        const isAdmin= await authAdmin(userId)

        //check if  not admin
        if(!isAdmin){
           return NextResponse.json({error:'Unauthorized Access'}, {status:403}) 
        }

        const {storeId}=await request.json()
        if(!storeId){
            return NextResponse.json({error:'Store ID is required'}, {status:400})
        }

       //let's find the store
       const store= await prisma.store.findUnique({
        where:{id:storeId}
       })

       //if a store is not found
       if(!store){
        return NextResponse.json({error:'Store not found'}, {status:404})
       }

       //suppose store is found, let's toggle the active status
      await prisma.store.update({
        where:{id:storeId},
        data:{isActive:!store.isActive}
       })
       return NextResponse.json({message:'Store status toggled successfully'}, {status:200})
    } catch (error) {
     console.error(error)
        return NextResponse.json({error:error.code || error.message}, {status:400})
    }
}