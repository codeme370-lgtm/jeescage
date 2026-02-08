import {NextResponse} from 'next/server'
import {getAuth} from '@clerk/nextjs/server'
import authAdmin from '@/middlewares/authAdmin'
import prisma from "@/lib/prisma"

//get all dashboard stats for admin
export async function GET(request) {
    try {
        //let's get our user
        const {userId}=getAuth(request)
        const isAdmin= await authAdmin(userId)
        //check if  not admin
        if(!isAdmin){
           return NextResponse.json({error:'Unauthorized Access'}, {status:403}) 
        }

        //get total orders suppose admin true
        const orders=await prisma.order.count()

        //get total stores on the app
        const stores=await prisma.store.count()

        //get total users on the app
        const users=await prisma.user.count()

        //get all orders include only createdAt and calculate  to revenue

        const allOrders= await prisma.order.findMany({
            select:{
                createdAt:true,
                total:true}
        })

        let totalRevenue=0
        allOrders.forEach(order=>{
            totalRevenue +=order.total
        })
        const revenue= totalRevenue.toFixed(2)
        //total number of products on the app
        const products= await prisma.product.count()

        //let's create the dashboard data object
       const dashboardData={
        orders,
        stores,
        products,
        revenue,
        allOrders
    }
    //lets return a response
        return NextResponse.json({dashboardData}, {status:200}) 
    } catch (error) {
     console.error(error)
        return NextResponse.json({error:error.code || error.message}, {status:400})
    }
}