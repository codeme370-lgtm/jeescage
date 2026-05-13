"use client"
import Link from "next/link"
import { useAuth } from "@/context/AuthContext"
import { Menu, Bell } from "lucide-react"
import { useEffect, useState, useRef } from "react"
import Pusher from "pusher-js"
import toast from "react-hot-toast"
import axios from "axios"
import { useRouter } from "next/navigation"


const StoreNavbar = ({ onMenuClick }) => {
    const { user, signOut } = useAuth()
    const [unreadCount, setUnreadCount] = useState(0)
    const [deliveryReportCount, setDeliveryReportCount] = useState(0)
    const [showDropdown, setShowDropdown] = useState(false)
    const [recentAlerts, setRecentAlerts] = useState([])
    const router = useRouter()
    const containerRef = useRef(null)

    const [pulse, setPulse] = useState(false)
    const [pusherClient, setPusherClient] = useState(null)

    const fetchRecent = async () => {
        try {
            const token = await getToken()
            if (!token) return null
            const { data } = await axios.get('/api/store/address-alerts', {
                headers: { Authorization: `Bearer ${token}` }
            })
            const alerts = (data.alerts || [])
            setRecentAlerts(alerts.slice(0, 5))
            setUnreadCount(alerts.filter(a => !a.isRead).length)
            // fetch delivery report count too
            try {
                const dr = await axios.get('/api/store/delivery-reports', { headers: { Authorization: `Bearer ${token}` } })
                setDeliveryReportCount((dr.data.reports || []).length)
            } catch (e) {
                console.warn('Failed to fetch delivery reports', e)
            }
            return alerts[0]?.storeId || null
        } catch (err) {
            console.warn('Failed to fetch recent alerts', err)
            return null
        }
    }

    useEffect(() => {
        let channel
        const init = async () => {
            const storeId = await fetchRecent()
            if (!storeId) return
            if (!pusherClient) {
                const p = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY, {
                    cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER,
                    authEndpoint: "/api/pusher/auth",
                    auth: {
                        headers: { Authorization: `Bearer ${await getToken()}` }
                    }
                })
                setPusherClient(p)
                channel = p.subscribe(`private-store-${storeId}`)
                    channel.bind('addressChange', (payload) => {
                        setRecentAlerts(prev => {
                            const next = [payload, ...prev.filter(a => a.id !== payload.id)].slice(0, 5)
                            return next
                        })
                        setUnreadCount(c => c + 1)
                        setPulse(true)
                        setTimeout(() => setPulse(false), 2000)
                    })
                    // Listen for delivery report events and show them in the same alerts dropdown
                    channel.bind('deliveryReport', (payload) => {
                        const reportAlert = {
                            id: payload.id || `dr-${Date.now()}`,
                            storeId: payload.storeId,
                            isRead: false,
                            createdAt: payload.createdAt || new Date().toISOString(),
                            user: payload.user ? { name: payload.user.name || payload.userId } : { name: 'Customer' },
                            order: { id: payload.orderId },
                            type: 'deliveryReport',
                            status: payload.status
                        }
                        setRecentAlerts(prev => {
                            const next = [reportAlert, ...prev.filter(a => a.id !== reportAlert.id)].slice(0, 5)
                            return next
                        })
                        setUnreadCount(c => c + 1)
                        setPulse(true)
                        setTimeout(() => setPulse(false), 2000)
                        toast.success('Delivery report received')
                    })
            }
        }
        init()
        return () => {
            if (channel && pusherClient) {
                pusherClient.unsubscribe(channel.name)
            }
        }
    }, [pusherClient])

    // close dropdown on outside click
    useEffect(() => {
        const onClick = (e) => {
            if (containerRef.current && !containerRef.current.contains(e.target)) {
                setShowDropdown(false)
            }
        }
        document.addEventListener('click', onClick)
        return () => document.removeEventListener('click', onClick)
    }, [])

    return (
        <div className="flex items-center justify-between px-12 py-3 border-b border-slate-200 transition-all">
            <div className="flex items-center gap-4">
                <button onClick={onMenuClick} className="p-2 hover:bg-slate-100 rounded-md" aria-label="Open menu">
                    <Menu size={24} />
                </button>
                <Link href="/" className="relative text-5xl md:text-6xl font-semibold text-slate-700">
                    <span className="text-red-600">jees</span>cage<span className="text-red-600 text-6xl md:text-7xl leading-0">.</span>
                    <p className="absolute text-xs font-semibold -top-1 -right-11 px-3 p-0.5 rounded-full flex items-center gap-2 text-white bg-red-600">
                        Store
                    </p>
                </Link>
            </div>
            <div className="flex items-center gap-3">
                <div ref={containerRef} className="relative">
                    <button
                        onClick={async () => {
                            const opening = !showDropdown
                            setShowDropdown(opening)
                            if (opening) await fetchRecent()
                        }}
                        className="relative p-2 hover:bg-slate-100 rounded-md"
                        aria-label="Address change alerts"
                    >
                        <Bell size={20} />
                        {unreadCount > 0 && (
                                <span className={`absolute -top-1 -right-1 inline-flex items-center justify-center px-2 py-0.5 rounded-full text-xs font-semibold bg-red-600 text-white ${pulse ? 'animate-pulse' : ''}`}>
                                    {unreadCount}
                                </span>
                            )}
                        {deliveryReportCount > 0 && (
                            <span className="absolute -bottom-1 -right-1 inline-flex items-center justify-center w-5 h-5 rounded-full text-xs font-semibold bg-amber-600 text-white">
                                {deliveryReportCount}
                            </span>
                        )}
                    </button>

                    {showDropdown && (
                        <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                            <div className="p-3 border-b border-gray-100 flex items-center justify-between">
                                <span className="font-medium">Address Changes</span>
                                <button onClick={() => { setShowDropdown(false); router.push('/store/address-changes') }} className="text-sm text-blue-600 hover:underline">View all</button>
                            </div>
                            <div className="max-h-64 overflow-y-auto">
                                {recentAlerts.length === 0 ? (
                                    <div className="p-4 text-sm text-gray-500">No recent address changes</div>
                                ) : recentAlerts.map(alert => (
                                    <div key={alert.id} className={`p-3 hover:bg-gray-50 cursor-pointer flex items-start gap-3 ${!alert.isRead ? 'bg-yellow-50' : ''}`}>
                                        <div className="flex-1" onClick={() => router.push('/store/address-changes')}>
                                            <div className="flex items-center justify-between">
                                                <div className="text-sm font-medium text-slate-800">{alert.user?.name || alert.order?.user?.name}</div>
                                                <div className="text-xs text-gray-400">{new Date(alert.createdAt).toLocaleString()}</div>
                                            </div>
                                            <div className="text-xs text-gray-600 mt-1">
                                                Order #{alert.order?.id?.slice(0,8)} • {alert.isRead ? 'Verified' : 'Pending'}
                                            </div>
                                        </div>
                                        {!alert.isRead && (
                                            <button
                                                onClick={async (e) => {
                                                    e.stopPropagation()
                                                    // optimistic update
                                                    setRecentAlerts(prev => prev.map(a => a.id === alert.id ? { ...a, isRead: true } : a))
                                                    setUnreadCount(c => Math.max(0, c - 1))
                                                    toast.success('Marked as verified')
                                                    try {
                                                        const token = await getToken()
                                                        if (!token) throw new Error('Authentication required')
                                                        await axios.patch('/api/store/address-alerts', { alertId: alert.id }, { headers: { Authorization: `Bearer ${token}` } })
                                                    } catch (err) {
                                                        // revert optimistic change
                                                        setRecentAlerts(prev => prev.map(a => a.id === alert.id ? { ...a, isRead: false } : a))
                                                        setUnreadCount(c => c + 1)
                                                        toast.error('Failed to mark. Try again.')
                                                    }
                                                }}
                                                className="text-xs text-green-600 font-medium px-2 py-1 rounded"
                                            >
                                                Mark
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
                <div className="flex items-center gap-3">
                    <p>Hi, {user?.firstName || user?.fullName?.split(' ')[0] || 'Seller'}</p>
                    <button onClick={signOut} className="text-xs text-slate-700 hover:text-orange-600">Sign Out</button>
                </div>
            </div>
        </div>
    )
}

export default StoreNavbar