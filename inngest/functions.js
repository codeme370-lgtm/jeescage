import {inngest} from './client.js'
import prisma from "../lib/prisma.js"

//Inngest function to delete coupons when they expire
export const deleteExpiredCoupons = inngest.createFunction(
    {id:'delete-expired-coupons'},
    {event:'app/coupon.expired'},
    async({event, step})=>{
        const {data} = event;
        return deleteExpiredCoupons(data, step);
    }
)

// push address-change notifications via Pusher
import pusher from '../lib/pusher.js'

export const pushAddressChange = inngest.createFunction(
    {id:'push-address-change'},
    {event:'app/address.change'},
    async({event})=>{
        const alert = event.data
        if(!alert || !alert.storeId) return
        try{
            await pusher.trigger(`private-store-${alert.storeId}`, 'addressChange', alert)
        }catch(e){
            console.error('Pusher trigger failed', e)
        }
    }
)

// push delivery-report notifications via Pusher
export const pushDeliveryReport = inngest.createFunction(
    {id: 'push-delivery-report'},
    {event: 'app/delivery.report'},
    async ({event}) => {
        const report = event.data
        if (!report || !report.storeId) return
        try {
            await pusher.trigger(`private-store-${report.storeId}`, 'deliveryReport', report)
        } catch (e) {
            console.error('Pusher trigger for delivery report failed', e)
        }
    }
)