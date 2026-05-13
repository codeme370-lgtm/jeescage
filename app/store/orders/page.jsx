'use client'

import { useEffect, useState } from "react"
import Loading from "@/components/Loading"
import AddressViewModal from "@/components/AddressViewModal"
import { useAuth } from "@/context/AuthContext"
import axios from "axios"
import toast from "react-hot-toast"
import { X, AlertCircle, CheckCircle } from "lucide-react"
import Link from "next/link"


export default function StoreOrders() {
    const [orders, setOrders] = useState([])
    const [alerts, setAlerts] = useState([])
    const [loading, setLoading] = useState(true)
    const [selectedOrder, setSelectedOrder] = useState(null)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [showAddrModal, setShowAddrModal] = useState(false)
    const [deliveryHours, setDeliveryHours] = useState(24)
    const [deliveryMessage, setDeliveryMessage] = useState('')
    const [sendingSms, setSendingSms] = useState(false)

    const {getToken} = useAuth()


    const fetchOrders = async () => {
       try {
        const token = await getToken()
        if (!token) {
            toast.error("Authentication required. Please sign in.")
            setLoading(false)
            return
        }
        const {data} = await axios.get("/api/store/orders", {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
        setOrders(data.orders)
        setLoading(false)
       } catch (error) {
        toast.error(error?.response?.data?.message || "Something went wrong while fetching orders")
       }finally {
        setLoading(false)
       }
    }

    const fetchAddressAlerts = async () => {
        try {
            let token
            try {
                token = await getToken()
            } catch (tErr) {
                console.warn('getToken failed in fetchAddressAlerts', tErr?.message)
            }
            if (!token) {
                // Not authenticated - clear alerts and return
                setAlerts([])
                return
            }

            // use fetch instead of axios to avoid Axios throwing on 401 and spamming console
            try {
                const resp = await fetch('/api/store/address-alerts?unreadOnly=true', {
                    headers: { Authorization: `Bearer ${token}` }
                })
                if (resp.status === 200) {
                    const body = await resp.json()
                    setAlerts(body.alerts || [])
                } else if (resp.status === 401) {
                    // token expired or unauthorized - clear alerts silently
                    console.warn('Address alerts unauthorized (401) — clearing alerts')
                    setAlerts([])
                } else if (resp.status === 404) {
                    setAlerts([])
                } else {
                    console.error('Unexpected status fetching address alerts', resp.status)
                    setAlerts([])
                }
            } catch (fetchErr) {
                console.error('Network error fetching address alerts', fetchErr)
                setAlerts([])
            }
        } catch (error) {
            // Handle 404 (no route or no store) gracefully
            const status = error?.response?.status
            if (status === 404) {
                setAlerts([])
                console.warn('Address alerts endpoint returned 404')
                return
            }
            console.error("Error fetching address alerts:", error)
            setAlerts([])
        }
    }

    const markAlertAsRead = async (alertId) => {
        try {
            const token = await getToken()
            if (!token) return

            await axios.patch("/api/store/address-alerts", { alertId }, {
                headers: { Authorization: `Bearer ${token}` }
            })
            setAlerts(prevAlerts => prevAlerts.filter(alert => alert.id !== alertId))
            toast.success("Alert marked as checked")
        } catch (error) {
            console.error("Error marking alert as read:", error)
            toast.error("Failed to dismiss alert")
        }
    }

    const getAlertForOrder = (orderId) => {
        return alerts.find(alert => alert.orderId === orderId)
    }

    const updateOrderStatus = async (orderId, status) => {
        // Logic to update the status of an order
        try {
            const token = await getToken()
            if (!token) {
                toast.error("Authentication required. Please sign in.")
                return
            }
            await axios.post("/api/store/orders", {orderId, status}, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })
            setOrders(prevOrders => prevOrders.map(order => order.id === orderId ? {...order, status} : order))
            toast.success("Order status updated successfully")
        } catch (error) {
            
        }


    }

    const openModal = (order) => {
        setSelectedOrder(order)
        // prefill a friendly message template
        const shortId = order?.id?.slice(0,8)
        const previewProducts = (order?.orderItems || []).map(i => i.product?.name).filter(Boolean).slice(0,3).join(', ')
        setDeliveryMessage(`Hello ${order.user?.name || ''}, thanks for buying ${previewProducts || 'your items'}. Your order #${shortId} will be delivered within the next ${deliveryHours} hours. — ${process.env.NEXT_PUBLIC_SITE_NAME || 'Jeeshop'}`)
        setIsModalOpen(true)
    }

    const closeModal = () => {
        setSelectedOrder(null)
        setIsModalOpen(false)
    }

    useEffect(() => {
        fetchOrders()
        fetchAddressAlerts()
        // Refresh alerts every 10 seconds
        const interval = setInterval(fetchAddressAlerts, 10000)
        return () => clearInterval(interval)
    }, [])

    if (loading) return <Loading />

    return (
        <>
            <div className="flex items-center gap-3 mb-5">
                <h1 className="text-2xl text-slate-500">Store <span className="text-slate-800 font-medium">Orders</span></h1>
                {alerts.length > 0 && (
                    <span className="bg-red-500 text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center">
                        {alerts.length}
                    </span>
                )}
                {alerts.length > 0 && (
                    <Link href="/store/address-changes" className="text-xs bg-blue-100 text-blue-700 hover:bg-blue-200 px-3 py-1 rounded-full transition">
                        View All Changes
                    </Link>
                )}
            </div>

            {/* Address Change Alerts */}
            {alerts.length > 0 && (
                <div className="mb-6 space-y-3">
                    {alerts.map((alert) => (
                        <div key={alert.id} className="bg-blue-50 border-l-4 border-blue-500 rounded-lg p-4 relative">
                            <div className="flex items-start gap-3">
                                <AlertCircle className="text-blue-600 mt-0.5 flex-shrink-0" size={20} />
                                <div className="flex-1">
                                    <h4 className="font-semibold text-blue-900 mb-1">Customer Changed Delivery Address</h4>
                                    <p className="text-sm text-blue-800 mb-2">
                                        <strong>{alert.user?.name}</strong> updated their delivery address for order <strong>#{alert.order?.id?.slice(0, 8)}</strong>
                                    </p>
                                    <div className="grid grid-cols-2 gap-3 text-xs text-blue-700 mt-2">
                                        <div className="bg-white bg-opacity-50 p-2 rounded">
                                            <p className="font-medium text-blue-900 mb-1">Old Address:</p>
                                            <p>{alert.oldAddress?.street}</p>
                                            <p>{alert.oldAddress?.city}, {alert.oldAddress?.state}</p>
                                        </div>
                                        <div className="bg-white bg-opacity-50 p-2 rounded border-2 border-blue-400">
                                            <p className="font-medium text-blue-900 mb-1">New Address:</p>
                                            <p>{alert.newAddress?.street}</p>
                                            <p>{alert.newAddress?.city}, {alert.newAddress?.state}</p>
                                        </div>
                                    </div>
                                    <p className="text-xs text-blue-600 mt-2">
                                        {new Date(alert.createdAt).toLocaleString()}
                                    </p>
                                </div>
                                <button
                                    onClick={() => markAlertAsRead(alert.id)}
                                    className="text-blue-600 hover:text-blue-800 flex-shrink-0 mt-1"
                                    title="Dismiss alert"
                                >
                                    <X size={20} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {orders.length === 0 ? (
                <p>No orders found</p>
            ) : (
                <div className="overflow-x-auto max-w-4xl rounded-md shadow border border-gray-200">
                    <table className="w-full text-sm text-left text-gray-600">
                        <thead className="bg-gray-50 text-gray-700 text-xs uppercase tracking-wider">
                            <tr>
                                {["Sr. No.", "Customer", "Address", "Total", "Payment", "Coupon", "Status", "Date"].map((heading, i) => (
                                    <th key={i} className="px-4 py-3">{heading}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {orders.map((order, index) => {
                                const orderAlert = getAlertForOrder(order.id)
                                const hasUnreadChange = !!orderAlert
                                return (
                                <tr
                                    key={order.id}
                                    className={`transition-colors duration-150 cursor-pointer ${hasUnreadChange ? 'bg-yellow-50 hover:bg-yellow-100' : 'hover:bg-gray-50'}`}
                                    onClick={() => {
                                        openModal(order)
                                        if (hasUnreadChange) {
                                            markAlertAsRead(orderAlert.id)
                                        }
                                    }}
                                >
                                    <td className="pl-6 text-red-600 relative" >
                                        <div className="flex items-center gap-2">
                                            <span>{index + 1}</span>
                                            {hasUnreadChange && (
                                                <span className="inline-flex items-center gap-1 text-xs bg-yellow-200 text-yellow-800 px-2 py-1 rounded-full font-medium" title="Address changed">
                                                    <AlertCircle size={12} />
                                                    Changed
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">{order.user?.name}</td>
                                    <td className="px-4 py-3 text-sm">
                                        <div className="flex items-center gap-2">
                                            <span>{`${order.address?.street || ''}, ${order.address?.city || ''}, ${order.address?.state || ''}`.slice(0, 40)}{(`${order.address?.street || ''}${order.address?.city || ''}${order.address?.state || ''}`).length > 40 ? '...' : ''}</span>
                                            <button onClick={(e) => { e.stopPropagation(); setSelectedOrder(order); setShowAddrModal(true); if (orderAlert) markAlertAsRead(orderAlert.id); }} className="text-xs text-blue-500 hover:underline whitespace-nowrap">View</button>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 font-medium text-slate-800">GHS {order.total}</td>
                                    <td className="px-4 py-3">{order.paymentMethod}</td>
                                    <td className="px-4 py-3">
                                        {order.isCouponUsed ? (
                                            <span className="bg-red-100 text-red-700 text-xs px-2 py-1 rounded-full">
                                                {order.coupon?.code}
                                            </span>
                                        ) : (
                                            "—"
                                        )}
                                    </td>
                                    <td className="px-4 py-3" onClick={(e) => { e.stopPropagation() }}>
                                        <select
                                            value={order.status}
                                            onChange={e => updateOrderStatus(order.id, e.target.value)}
                                            className="border-gray-300 rounded-md text-sm focus:ring focus:ring-blue-200"
                                        >
                                            <option value="ORDER_PLACED">ORDER_PLACED</option>
                                            <option value="PROCESSING">PROCESSING</option>
                                            <option value="SHIPPED">SHIPPED</option>
                                            <option value="DELIVERED">DELIVERED</option>
                                        </select>
                                    </td>
                                    <td className="px-4 py-3 text-gray-500">
                                        {new Date(order.createdAt).toLocaleString()}
                                    </td>
                                </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Modal */}
            {isModalOpen && selectedOrder && (
                <div onClick={closeModal} className="fixed inset-0 flex items-center justify-center bg-black/50 text-slate-700 text-sm backdrop-blur-xs z-50" >
                    <div onClick={e => e.stopPropagation()} className="bg-white rounded-lg shadow-lg max-w-2xl w-full p-6 relative">
                        <h2 className="text-xl font-semibold text-slate-900 mb-4 text-center">
                            Order Details
                        </h2>

                        {/* Customer Details */}
                        <div className="mb-4">
                            <h3 className="font-semibold mb-2">Customer Details</h3>
                            <p><span className="text-red-600">Name:</span> {selectedOrder.user?.name}</p>
                            <p><span className="text-red-600">Email:</span> {selectedOrder.user?.email}</p>
                                <p><span className="text-red-600">Phone:</span> {selectedOrder.address?.phone}</p>
                                <p className="flex items-center gap-2">
                                    <span className="text-red-600">Address:</span>
                                    <span className="text-slate-700">{`${selectedOrder.address?.street || ''}${selectedOrder.address?.street ? ', ' : ''}${selectedOrder.address?.city || ''}${selectedOrder.address?.city ? ', ' : ''}${selectedOrder.address?.state || ''}`.slice(0, 80)}{(selectedOrder.address && (`${selectedOrder.address.street || ''}` + `${selectedOrder.address.city || ''}`).length > 80) ? '...' : ''}</span>
                                    <button onClick={() => setShowAddrModal(true)} className="text-xs text-slate-500 hover:underline">View</button>
                                </p>
                        </div>

                        {/* Products */}
                        <div className="mb-4">
                            <h3 className="font-semibold mb-2">Products</h3>
                            <div className="space-y-2">
                                {selectedOrder.orderItems.map((item, i) => (
                                    <div key={i} className="flex items-center gap-4 border border-slate-100 shadow rounded p-2">
                                        <img
                                            src={item.product.images?.[0].src || item.product.images?.[0]}
                                            alt={item.product?.name}
                                            className="w-16 h-16 object-cover rounded"
                                        />
                                        <div className="flex-1">
                                            <p className="text-slate-800">{item.product?.name}</p>
                                            <p>Qty: {item.quantity}</p>
                                            <p>Price: GHS{item.price}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Payment & Status */}
                        <div className="mb-4">
                            <p><span className="text-red-600">Payment Method:</span> {selectedOrder.paymentMethod}</p>
                            <p><span className="text-red-600">Paid:</span> {selectedOrder.isPaid ? "Yes" : "No"}</p>
                            {selectedOrder.isCouponUsed && (
                                <p><span className="text-red-600">Coupon:</span> {selectedOrder.coupon.code} ({selectedOrder.coupon.discount}% off)</p>
                            )}
                            <p><span className="text-red-600">Status:</span> {selectedOrder.status}</p>
                            <p><span className="text-red-600">Order Date:</span> {new Date(selectedOrder.createdAt).toLocaleString()}</p>
                        </div>

                        {/* Delivery ETA controls */}
                        <div className="mb-4">
                            <h4 className="font-semibold mb-2">Send Delivery ETA</h4>
                            <div className="flex items-center gap-3 mb-2">
                                <label className="text-sm text-slate-600">Delivery window:</label>
                                <select value={deliveryHours} onChange={e => setDeliveryHours(Number(e.target.value))} className="border border-gray-300 rounded px-2 py-1">
                                    <option value={24}>24 hours</option>
                                    <option value={48}>48 hours</option>
                                    <option value={72}>72 hours</option>
                                </select>
                            </div>
                            <textarea rows={3} value={deliveryMessage} onChange={e => setDeliveryMessage(e.target.value)} className="w-full border border-gray-200 rounded p-2 text-sm" />
                            <div className="flex items-center justify-end gap-3 mt-2">
                                <button
                                    onClick={async (e) => { e.stopPropagation(); if (!selectedOrder) return; if (!selectedOrder.address?.phone) { toast.error('Customer phone number is missing'); return };
                                        try {
                                            setSendingSms(true)
                                            const token = await getToken()
                                            if (!token) { toast.error('Authentication required'); setSendingSms(false); return }
                                            const { data: resp } = await axios.post('/api/store/send-delivery-sms', { orderId: selectedOrder.id, hours: deliveryHours, message: deliveryMessage }, { headers: { Authorization: `Bearer ${token}` } })
                                            // if API returned updated order, update UI immediately
                                            if (resp?.order) {
                                                setOrders(prev => prev.map(o => o.id === resp.order.id ? resp.order : o))
                                                setSelectedOrder(resp.order)
                                            }
                                            toast.success('Delivery ETA SMS sent')
                                        } catch (err) {
                                            console.error('send SMS error', err)
                                            toast.error(err?.response?.data?.error || 'Failed to send SMS')
                                        } finally {
                                            setSendingSms(false)
                                        }
                                    }}
                                    disabled={sendingSms}
                                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-60"
                                >
                                    {sendingSms ? 'Sending…' : 'Send ETA'}
                                </button>
                            </div>
                        </div>

                        <div className="flex justify-end">
                            <button onClick={closeModal} className="px-4 py-2 bg-slate-200 rounded hover:bg-slate-300" >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {showAddrModal && selectedOrder && (
                <AddressViewModal address={selectedOrder.address} onClose={() => setShowAddrModal(false)} orderId={selectedOrder.id} orderStatus={selectedOrder.status} />
            )}
        </>
    )
}
