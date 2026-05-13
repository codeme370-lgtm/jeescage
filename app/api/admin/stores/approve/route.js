import {NextResponse} from 'next/server'
import { getSessionUserId } from "@/lib/authHelpers";
import authAdmin from '@/middlewares/authAdmin'
import prisma from "@/lib/prisma"


// approve or reject a store
export async function POST(request) {
    try {
        //let's get our user
        const userId = getSessionUserId(request)
        const isAdmin= await authAdmin(userId)

        //check if  not admin
        if(!isAdmin){
           return NextResponse.json({error:'Unauthorized Access'}, {status:403}) 
        }

        const {storeId, status} = await request.json()

        //check if required fields exist
        if(!storeId || !status || (status !== 'approved' && status !== 'rejected')){
           return NextResponse.json({error:'Invalid request'}, {status:400}) 
        }

        //update the store status
        const updatedStore = await prisma.store.update({
            where:{id:storeId},
            data: {
                status: status === 'approved' ? 'approved' : 'rejected'
            }
        })

        return NextResponse.json({message: `Store ${status}`, store: updatedStore}, {status:200})
    } catch (error) {
     console.error(error)
        return NextResponse.json({error:error.code || error.message}, {status:400})
    }
}
