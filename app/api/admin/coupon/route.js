import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import authAdmin from "@/middlewares/authAdmin";
import { inngest } from "@/lib/inngest";


//creating a coupon

export async function POST(request) {
    try {
       //let's get the user Id
       const { userId } = getAuth(request);
       //check if the user is an admin from the middleware
       const isAdmin = await authAdmin(userId)
       //if it is not an admin, return error
       if(!isAdmin){
        return NextResponse.json({ error: 'you are not authorized to perform this action' }, { status: 401 });
       }
       //if it an admin, return the coupon details from the request body
       const {coupon}=await request.json();
       //get the coupon code
       coupon.code=coupon.code.toUpperCase();

       await prisma.coupon.create({
        data:coupon
       }).then(async(coupon)=>{
// run inngest function to delete coupon on expiry
        await inngest.send(
        {
            name:'app/coupon.expired',
            data:{
                code:coupon.code,
                expires_at:coupon.expiresAt
            }
        })
       });
       return NextResponse.json({message:'coupon created successfully'});
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: error.code || error.message }, { status: 400 } )
    }
}

//Delete a coupon /api/coupon?id=couponId
export async function DELETE(request){
    try{
//let's get the user Id and check if admin
       const { userId } = getAuth(request);
       const isAdmin = await authAdmin(userId)
       //if it is not an admin, return error
       if(!isAdmin){
        return NextResponse.json({ error: 'you are not authorized to perform this action' }, { status: 401 });
       }
       //let's get the request url and search params
       const {searchParams}=new URL(request.url);
       const code=searchParams.get('code');

       //lets get code fom prisma and delete
       await prisma.coupon.delete({
        where:{code}
       })
       //return success message
       return NextResponse.json({message:'coupon deleted successfully'});
    }catch (error) {
        console.error(error);
        return NextResponse.json({ error: error.code || error.message }, { status: 400 } )
    }
}

//creating the api to get all coupons
export async function GET(request){
    try{
        //get the user and check if admin
       const { userId } = getAuth(request);
       const isAdmin = await authAdmin(userId)
       //if it is not an admin, return error
       if(!isAdmin){
        return NextResponse.json({ error: 'you are not authorized to perform this action' }, { status: 401 });
       }
       //fetch all coupons from prisma
       const coupons=await prisma.coupon.findMany({
        orderBy:{createdAt:'desc'}
       })
       //return the response
       return NextResponse.json({coupons});

    }catch (error) {
        console.error(error);
        return NextResponse.json({ error: error.code || error.message }, { status: 400 } )
    }
}