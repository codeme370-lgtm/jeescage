'use client'
import Image from "next/image";
import { DotIcon } from "lucide-react";
import { useSelector } from "react-redux";
import Rating from "./Rating";
import { useState } from "react";
import RatingModal from "./RatingModal";
import AddressViewModal from "./AddressViewModal";
import { useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";

const OrderItem = ({ order, onAddressUpdated }) => {

    const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || 'GHS';
    const [ratingModal, setRatingModal] = useState(null);

    const { ratings } = useSelector(state => state.rating);
    const [addr, setAddr] = useState(order.address || {});
    const [showAddrModal, setShowAddrModal] = useState(false);
    const [timeLeft, setTimeLeft] = useState(null)
    const [reporting, setReporting] = useState(false)

    useEffect(() => {
        let timer
        if (order.deliveryDeadline) {
            const update = () => {
                const deadline = new Date(order.deliveryDeadline).getTime()
                const now = Date.now()
                const diff = Math.max(0, Math.floor((deadline - now) / 1000))
                setTimeLeft(diff)
            }
            update()
            timer = setInterval(update, 1000)
        } else {
            setTimeLeft(null)
        }
        return () => clearInterval(timer)
    }, [order.deliveryDeadline])

    return (
        <>
            <tr className="text-sm">
                <td className="text-left">
                    <div className="flex flex-col gap-6">
                        {order.orderItems.map((item, index) => (
                            <div key={index} className="flex items-center gap-4">
                                <div className="w-20 aspect-square bg-slate-100 flex items-center justify-center rounded-md">
                                    <Image
                                        className="h-14 w-auto"
                                        src={item.product.images[0]}
                                        alt="product_img"
                                        width={50}
                                        height={50}
                                    />
                                </div>
                                <div className="flex flex-col justify-center text-sm">
                                    <p className="font-medium text-slate-600 text-base">{item.product.name}</p>
                                    <p>{currency}{item.price} Qty : {item.quantity}</p>
                                    {item.selectedColor && <p className="text-xs text-slate-500">Color: {item.selectedColor}</p>}
                                    <p className="mb-1">{new Date(order.createdAt).toDateString()}</p>
                                    <div>
                                        {ratings.find(rating => order.id === rating.orderId && item.product.id === rating.productId)
                                            ? <Rating value={ratings.find(rating => order.id === rating.orderId && item.product.id === rating.productId).rating} />
                                            : <button onClick={() => setRatingModal({ orderId: order.id, productId: item.product.id })} className={`text-green-500 hover:bg-green-50 transition ${order.status !== "DELIVERED" && 'hidden'}`}>Rate Product</button>
                                        }</div>
                                    {ratingModal && <RatingModal ratingModal={ratingModal} setRatingModal={setRatingModal} />}
                                </div>
                            </div>
                        ))}
                    </div>
                </td>

                <td className="text-center max-md:hidden">{currency}{order.total}</td>

                <td className="text-left max-md:hidden">
                    <button onClick={() => setShowAddrModal(true)} className="text-xs text-slate-500 hover:underline">View</button>
                </td>

                <td className="text-left space-y-2 text-sm max-md:hidden">
                    <div
                        className={`flex items-center justify-center gap-1 rounded-full p-1 ${order.status === 'confirmed'
                            ? 'text-yellow-500 bg-yellow-100'
                            : order.status === 'delivered'
                                ? 'text-green-500 bg-green-100'
                                : 'text-slate-500 bg-slate-100'
                            }`}
                    >
                        <DotIcon size={10} className="scale-250" />
                        {order.status.split('_').join(' ').toLowerCase()}
                    </div>
                    {/* Delivery countdown & report buttons */}
                    <div className="mt-2 text-xs text-slate-500">
                        {order.deliveryDeadline ? (
                            <>
                                <div>Delivery ETA: <strong>{new Date(order.deliveryDeadline).toLocaleString()}</strong></div>
                                <div className="mt-1 text-sm">
                                    {timeLeft !== null ? (
                                        timeLeft > 0 ? (
                                            <span>Time left: {Math.floor(timeLeft/3600)}h {Math.floor((timeLeft%3600)/60)}m {timeLeft%60}s</span>
                                        ) : (
                                            <span className="text-red-600">Delivery window elapsed</span>
                                        )
                                    ) : null}
                                </div>
                            </>
                        ) : (
                            <div className="text-sm text-slate-500">Delivery ETA not provided</div>
                        )}

                        <div className="mt-2 flex items-center gap-2">
                            <button onClick={async () => {
                                try {
                                    setReporting(true)
                                    await axios.post('/api/orders/report-delivery', { orderId: order.id, status: 'RECEIVED' })
                                    toast.success('Reported as received — the store has been notified')
                                } catch (err) {
                                    console.error(err)
                                    toast.error(err?.response?.data?.error || 'Failed to report')
                                } finally { setReporting(false) }
                            }} disabled={reporting} className="px-3 py-1 text-sm bg-blue-600 text-white rounded">Mark Received</button>

                            <button onClick={async () => {
                                try {
                                    setReporting(true)
                                    await axios.post('/api/orders/report-delivery', { orderId: order.id, status: 'NOT_RECEIVED' })
                                    toast.success('Reported as not received — the store has been notified')
                                } catch (err) {
                                    console.error(err)
                                    toast.error(err?.response?.data?.error || 'Failed to report')
                                } finally { setReporting(false) }
                            }} disabled={reporting || (timeLeft !== null && timeLeft > 0)} className={`px-3 py-1 text-sm rounded ${ (timeLeft !== null && timeLeft > 0) ? 'bg-gray-300 text-gray-600' : 'bg-red-600 text-white' }`}>
                                Report Not Received
                            </button>
                        </div>
                    </div>
                </td>
            </tr>
            {/* Mobile */}
            <tr className="md:hidden">
                <td colSpan={5}>
                    <div className="flex items-center justify-between">
                        <div />
                        <div>
                            <button onClick={() => setShowAddrModal(true)} className="text-sm text-slate-500 hover:underline">View Address</button>
                        </div>
                    </div>
                    <br />
                    <div className="text-center text-sm text-slate-600 mb-2">
                        {order.deliveryDeadline ? (
                            <>
                                <div>Delivery ETA: {new Date(order.deliveryDeadline).toLocaleString()}</div>
                                <div className="mt-1">
                                    {timeLeft !== null ? (timeLeft > 0 ? (
                                        <div>Time left: {Math.floor(timeLeft/3600)}h {Math.floor((timeLeft%3600)/60)}m</div>
                                    ) : (
                                        <div className="text-red-600">Delivery window elapsed</div>
                                    )) : null}
                                </div>
                            </>
                        ) : (
                            <div className="text-sm text-slate-500">Delivery ETA not provided</div>
                        )}

                        <div className="mt-2 flex items-center gap-2 justify-center">
                            <button onClick={async () => {
                                try { setReporting(true); await axios.post('/api/orders/report-delivery', { orderId: order.id, status: 'RECEIVED' }); toast.success('Reported as received — store notified') } catch (err) { console.error(err); toast.error(err?.response?.data?.error || 'Failed') } finally { setReporting(false) }
                            }} disabled={reporting || order.deliveryConfirmed} className={`px-3 py-1 text-sm rounded ${order.deliveryConfirmed ? 'bg-gray-200 text-gray-600' : 'bg-blue-600 text-white'}`}>
                                {order.deliveryConfirmed ? 'Marked Received' : 'Mark Received'}
                            </button>
                            <button onClick={async () => {
                                try { setReporting(true); await axios.post('/api/orders/report-delivery', { orderId: order.id, status: 'NOT_RECEIVED' }); toast.success('Reported as not received — store notified') } catch (err) { console.error(err); toast.error(err?.response?.data?.error || 'Failed') } finally { setReporting(false) }
                            }} disabled={reporting || (timeLeft !== null && timeLeft > 0)} className={`px-3 py-1 text-sm rounded ${ (timeLeft !== null && timeLeft > 0) ? 'bg-gray-300 text-gray-600' : 'bg-red-600 text-white' }`}>Report Not Received</button>
                        </div>
                    </div>
                    <div className="flex items-center">
                        <span className='text-center mx-auto px-6 py-1.5 rounded bg-green-100 text-green-700' >
                            {order.status.replace(/_/g, ' ').toLowerCase()}
                        </span>
                    </div>
                </td>
            </tr>
            {showAddrModal && <AddressViewModal 
                address={addr} 
                onClose={() => setShowAddrModal(false)} 
                orderId={order.id}
                orderStatus={order.status}
                onAddressUpdated={(updatedOrder) => {
                    setAddr(updatedOrder.address)
                    onAddressUpdated?.(updatedOrder)
                }}
            />}
            <tr>
                <td colSpan={4}>
                    <div className="border-b border-slate-300 w-6/7 mx-auto" />
                </td>
            </tr>
        </>
    )
}

export default OrderItem