import {inngest} from './client.js'
import prisma from "../lib/prisma.js"

// extracted handlers so we can call them directly in tests
export async function handleUserCreated(data){
    console.log('[inngest] handleUserCreated start', { id: data?.id });
    try{
        const user = await prisma.user.upsert({
            where: { id: data.id },
            create: {
                id: data.id,
                email: data.email_address?.[0]?.email_address || null,
                name: `${data.first_name || ''} ${data.last_name || ''}`.trim() || null,
                image: data.image_url || null,
            },
            update: {
                email: data.email_address?.[0]?.email_address || undefined,
                name: `${data.first_name || ''} ${data.last_name || ''}`.trim() || undefined,
                image: data.image_url || undefined,
            },
        })
        console.log('[inngest] handleUserCreated success', { id: user.id })
        return user;
    }catch(err){
        console.error('[inngest] handleUserCreated error', err)
        throw err
    }
}

export async function handleUserUpdated(data){
    console.log('[inngest] handleUserUpdated start', { id: data?.id });
    try{
        const user = await prisma.user.update({
            where:{ id: data.id },
            data:{
                email: data.email_address?.[0]?.email_address || undefined,
                name: `${data.first_name || ''} ${data.last_name || ''}`.trim() || undefined,
                image: data.image_url || undefined,
            }
        })
        console.log('[inngest] handleUserUpdated success', { id: user.id })
        return user;
    }catch(err){
        console.error('[inngest] handleUserUpdated error', err)
        throw err
    }
}

export async function handleUserDeleted(data){
    console.log('[inngest] handleUserDeleted start', { id: data?.id });
    try{
        const user = await prisma.user.delete({ where: { id: data.id } })
        console.log('[inngest] handleUserDeleted success', { id: user.id })
        return user;
    }catch(err){
        console.error('[inngest] handleUserDeleted error', err)
        throw err
    }
}

//Inngest function to delete coupons when they expire (extracted)
export async function handleDeleteExpiredCoupon(data, step){
    console.log('[inngest] handleDeleteExpiredCoupon start', { code: data?.code });
    try{
        const expiryDate = new Date(data.expiresAt);
        await step.sleepUntil('wait-for-expiry', expiryDate);
        await step.run('delete-coupon-from-database', async()=>{
            await prisma.coupon.delete({ where: { code: data.code } })
        })
        console.log('[inngest] handleDeleteExpiredCoupon success', { code: data.code });
    }catch(err){
        console.error('[inngest] handleDeleteExpiredCoupon error', err)
        throw err
    }
}

//create an inngest function to save all user data
export const synUserCreation = inngest.createFunction(
    {id:'sync-user-create'},
    {event:'clerk/user.created'},
    async ({event})=>{
        const {data} = event;
        return handleUserCreated(data);
    }
)

//Function for the user data update
export const syncUserUpdation = inngest.createFunction(
    {id:'syn-user-update'},
    {event:'clerk/user.updated'},
    async({event})=>{
        const {data} = event;
        return handleUserUpdated(data);
    }
)

//Delete a user from the database
export const syncUserDeletion = inngest.createFunction(
    {id:'syn-user-delete'},
    {event:'clerk/user.deleted'},
    async({event})=>{
        const {data} = event;
        return handleUserDeleted(data);
    }
)

//Inngest function to delete coupons when they expire
export const deleteExpiredCoupons = inngest.createFunction(
    {id:'delete-expired-coupons'},
    {event:'app/coupon.expired'},
    async({event, step})=>{
        const {data} = event;
        return handleDeleteExpiredCoupon(data, step);
    }
)