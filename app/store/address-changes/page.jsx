'use client'

import { useEffect, useState } from "react"
import Loading from "@/components/Loading"
import { useAuth } from "@/context/AuthContext"
import axios from "axios"
import toast from "react-hot-toast"
import { ArrowRight, CheckCircle, Clock } from "lucide-react"
import Link from "next/link"


export default function AddressChanges() {
    const [alerts, setAlerts] = useState([])
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState('all') // 'all', 'unread'

    const { getToken } = useAuth()

    const fetchAllAlerts = async () => {
        try {
            const token = await getToken()
            if (!token) {
                toast.error("Authentication required. Please sign in.")
                setLoading(false)
                return
            }
            
            const { data } = await axios.get("/api/store/address-alerts", {
                headers: { Authorization: `Bearer ${token}` }
            })
            setAlerts(data.alerts || [])
            setLoading(false)
        } catch (error) {
            console.error("Error fetching address changes:", error)
            toast.error(error?.response?.data?.message || "Failed to load address changes")
            setLoading(false)
        }
    }

    const markAlertAsRead = async (alertId) => {
        try {
            const token = await getToken()
            if (!token) return

            await axios.patch("/api/store/address-alerts", { alertId }, {
                headers: { Authorization: `Bearer ${token}` }
            })
            
            setAlerts(prevAlerts => prevAlerts.map(alert => 
                alert.id === alertId ? { ...alert, isRead: true } : alert
            ))
            toast.success("Marked as verified")
        } catch (error) {
            console.error("Error marking alert as read:", error)
            toast.error("Failed to mark as verified")
        }
    }

    useEffect(() => {
        fetchAllAlerts()
    }, [])

    const filteredAlerts = filter === 'unread' 
        ? alerts.filter(alert => !alert.isRead)
        : alerts

    if (loading) return <Loading />

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-3xl font-bold text-slate-800">
                    Address Change History
                </h1>
                <Link href="/store/orders" className="text-blue-500 hover:text-blue-700 font-medium">
                    ← Back to Orders
                </Link>
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-2 mb-6">
                <button
                    onClick={() => setFilter('all')}
                    className={`px-4 py-2 rounded-lg font-medium transition ${
                        filter === 'all'
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                >
                    All Changes ({alerts.length})
                </button>
                <button
                    onClick={() => setFilter('unread')}
                    className={`px-4 py-2 rounded-lg font-medium transition ${
                        filter === 'unread'
                            ? 'bg-yellow-500 text-white'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                >
                    Pending Review ({alerts.filter(a => !a.isRead).length})
                </button>
            </div>

            {filteredAlerts.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                    <p className="text-gray-500 text-lg mb-2">
                        {filter === 'unread' ? 'No pending address changes' : 'No address changes yet'}
                    </p>
                    <p className="text-gray-400 text-sm">
                        {filter === 'unread' 
                            ? 'All address changes have been verified'
                            : 'Address changes will appear here'}
                    </p>
                </div>
            ) : (
                <div className="space-y-4">
                    {filteredAlerts.map((alert) => (
                        <div
                            key={alert.id}
                            className={`border-2 rounded-lg p-6 transition ${
                                alert.isRead
                                    ? 'border-gray-200 bg-white'
                                    : 'border-yellow-400 bg-yellow-50'
                            }`}
                        >
                            {/* Header */}
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <h3 className="text-lg font-semibold text-slate-800">
                                            {alert.user?.name}
                                        </h3>
                                        <span className="text-sm text-gray-500">
                                            Order #{alert.order?.id?.slice(0, 8)}
                                        </span>
                                        {!alert.isRead && (
                                            <span className="inline-flex items-center gap-1 bg-yellow-200 text-yellow-800 text-xs px-3 py-1 rounded-full font-medium">
                                                <Clock size={12} />
                                                Pending Review
                                            </span>
                                        )}
                                        {alert.isRead && (
                                            <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 text-xs px-3 py-1 rounded-full font-medium">
                                                <CheckCircle size={12} />
                                                Verified
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-sm text-gray-500">
                                        Changed on {new Date(alert.createdAt).toLocaleString()}
                                    </p>
                                </div>
                            </div>

                            {/* Customer Contact Info */}
                            <div className="bg-gray-50 rounded-lg p-4 mb-4">
                                <h4 className="font-semibold text-slate-700 mb-2">Customer Contact</h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-xs text-gray-500">Email</p>
                                        <p className="text-sm font-medium text-slate-700">{alert.user?.email}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500">Name</p>
                                        <p className="text-sm font-medium text-slate-700">{alert.order?.user?.name}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Address Change Comparison */}
                            <div className="grid grid-cols-2 gap-4 mb-4">
                                {/* Old Address */}
                                <div className="border border-red-200 rounded-lg p-4 bg-red-50">
                                    <h4 className="font-semibold text-red-900 mb-3 flex items-center gap-2">
                                        <span className="bg-red-200 rounded-full w-6 h-6 flex items-center justify-center text-xs">✕</span>
                                        Old Address
                                    </h4>
                                    <div className="text-sm space-y-1 text-red-900">
                                        <p className="font-medium">{alert.oldAddress?.name}</p>
                                        <p>{alert.oldAddress?.email}</p>
                                        <p>{alert.oldAddress?.street}</p>
                                        <p>{alert.oldAddress?.city}, {alert.oldAddress?.state}</p>
                                        <p>{alert.oldAddress?.zip} {alert.oldAddress?.country}</p>
                                        <p>📞 {alert.oldAddress?.phone}</p>
                                    </div>
                                </div>

                                {/* New Address */}
                                <div className="border border-green-200 rounded-lg p-4 bg-green-50">
                                    <h4 className="font-semibold text-green-900 mb-3 flex items-center gap-2">
                                        <span className="bg-green-200 rounded-full w-6 h-6 flex items-center justify-center text-xs">✓</span>
                                        New Address
                                    </h4>
                                    <div className="text-sm space-y-1 text-green-900">
                                        <p className="font-medium">{alert.newAddress?.name}</p>
                                        <p>{alert.newAddress?.email}</p>
                                        <p>{alert.newAddress?.street}</p>
                                        <p>{alert.newAddress?.city}, {alert.newAddress?.state}</p>
                                        <p>{alert.newAddress?.zip} {alert.newAddress?.country}</p>
                                        <p>📞 {alert.newAddress?.phone}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Order Summary */}
                            <div className="bg-slate-100 rounded-lg p-4 mb-4">
                                <h4 className="font-semibold text-slate-700 mb-2">Order Summary</h4>
                                <div className="space-y-2">
                                    {alert.order?.orderItems?.slice(0, 3).map((item) => (
                                        <div key={item.productId} className="text-sm flex items-center justify-between">
                                            <span className="text-gray-700">{item.product?.name} (x{item.quantity})</span>
                                            <span className="font-medium">GHS {item.price}</span>
                                        </div>
                                    ))}
                                    {alert.order?.orderItems?.length > 3 && (
                                        <p className="text-xs text-gray-500 italic">
                                            +{alert.order.orderItems.length - 3} more items
                                        </p>
                                    )}
                                </div>
                                <div className="mt-3 pt-3 border-t border-gray-300 flex justify-between">
                                    <span className="font-medium text-slate-700">Total:</span>
                                    <span className="font-bold text-slate-800">GHS {alert.order?.total}</span>
                                </div>
                            </div>

                            {/* Actions */}
                            {!alert.isRead && (
                                <button
                                    onClick={() => markAlertAsRead(alert.id)}
                                    className="w-full bg-green-500 hover:bg-green-600 text-white font-medium py-2 rounded-lg transition flex items-center justify-center gap-2"
                                >
                                    <CheckCircle size={18} />
                                    Mark as Verified
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
