import {inngest} from './client.js'
import prisma from "../lib/prisma.js"

//create an inngest function to save all user data
export const synUserCreation = inngest.createFunction(
    {id:'sync-user-create'},
    {event:'clerk/user.created'},
    async ({event})=>{
        const {data} = event
        await prisma.user.create({
            data:{
                id:data.id,
                email: data.email_addresses[0].email_address,
                name:`${data.first_name} ${data.last_name}`,
                image: data.image_url
            }
        })
    }
)

//Function for the user data update
export const syncUserUpdation = inngest.createFunction(
    {id:'syn-user-update'},
    {event:'clerk/user.updated'},
    async({event})=>{
        const {data} = event;
       await prisma.user.update({
        data:{
                email: data.email_addresses[0].email_address,
                name:`${data.first_name} ${data.last_name}`,
                image: data.image_url
            }
       })
    }
)

//Delete a user from the database
export const syncUserDeletion = inngest.createFunction(
    {id:'syn-user-delete'},
    {event:'clerk/user.deleted'},
    async({event})=>{
        const {data} = event;
       await prisma.user.delete({
        where:{id: data.id,}
       })
    }
)

//Inngest function to delete coupons when they expire
export const deleteExpiredCoupons = inngest.createFunction(
    {id:'delete-expired-coupons'},
    {event:'app/coupon.expired'},
    async({event, step})=>{
        const {data} = event;
        return deleteExpiredCoupons(data, step);
    }
)