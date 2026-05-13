import {NextResponse} from 'next/server'
import { getSessionUserId } from "@/lib/authHelpers";
import authAdmin from '@/middlewares/authAdmin'
import prisma from "@/lib/prisma"

//approve a seller

export async function POST(request) {
    try {
        //let's get our user
        const userId = getSessionUserId(request)
        const isAdmin= await authAdmin(userId)
        //check if  not admin
        if(!isAdmin){
           return NextResponse.json({error:'Unauthorized Access'}, {status:403}) 
        }
        //suppose is an admin
        const {storeId, status}=await request.json()
      //if status is approved 
      if(status ==='approved'){
        //let's approve the store
        await prisma.store.update({
            where :{id:storeId},
            data:{status:'approved', isActive:true}
        })
        }else if(status==='rejected'){
            await prisma.store.update({
            where :{id:storeId},
            data:{status:'rejected'}
        })
        }
        return NextResponse.json({message:status + 'successfully'})
    } catch (error) {
        console.error(error)
        return NextResponse.json({error:error.code || error.message}, {status:400})
    }
}

// get all pending and rejected stores
export async function GET(request) {
    try {
        //let's get our user
        const userId = getSessionUserId(request)
        const isAdmin= await authAdmin(userId)

        //check if  not admin
        if(!isAdmin){
           return NextResponse.json({error:'Unauthorized Access'}, {status:403}) 
        }

        //let's get all store
        const stores= await prisma.store.findMany({
            where:{status:{in:['pending','rejected']}},
            include:{user:true}
        })
        return NextResponse.json({stores}, {status:200})
    } catch (error) {
     console.error(error)
        return NextResponse.json({error:error.code || error.message}, {status:400})
    }
}