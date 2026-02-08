import {getAuth} from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import authAdmin from '@/middlewares/authAdmin'

//Auth Administrator
export async function GET(request) {
    try {
        //let's get the user 
        const {userId}=getAuth(request)
        const isAdmin= await authAdmin(userId)

        return NextResponse.json({isAdmin}, {status:200})
    } catch (error) {
        console.error(error)
        return NextResponse.json({isAdmin: false, error:'Internal Server Error'}, {status:500})
    }
}

