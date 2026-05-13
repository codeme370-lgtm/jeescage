import {NextResponse} from 'next/server'
import { getSessionUserId } from "@/lib/authHelpers";
import authAdmin from '@/middlewares/authAdmin'
import prisma from "@/lib/prisma"


// get all pending stores
export async function GET(request) {
    try {
        //let's get our user
        const userId = getSessionUserId(request)
        const isAdmin= await authAdmin(userId)

        //check if  not admin
        if(!isAdmin){
           return NextResponse.json({error:'Unauthorized Access'}, {status:403}) 
        }

        //let's get all pending stores
        const stores= await prisma.store.findMany({
            where:{status:'pending'},
            include:{user:true}
        })
        return NextResponse.json({stores}, {status:200})
    } catch (error) {
     console.error(error)
        return NextResponse.json({error:error.code || error.message}, {status:400})
    }
}
