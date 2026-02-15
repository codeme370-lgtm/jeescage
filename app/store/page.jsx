'use client'
import Loading from "@/components/Loading"
import AddressViewModal from "@/components/AddressViewModal"
import { CircleDollarSignIcon, ShoppingBasketIcon, StarIcon, TagsIcon } from "lucide-react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { useAuth } from "@clerk/nextjs"
import axios from "axios"
import { toast } from "react-hot-toast"


export default function Dashboard() {
    const {getToken} = useAuth()

    const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || 'GHS'

    const router = useRouter()

    const [loading, setLoading] = useState(true)
    const [dashboardData, setDashboardData] = useState({
        totalProducts: 0,
        totalEarnings: 0,
        totalOrders: 0,
        ratings: [],
    })
    const [storeInfo, setStoreInfo] = useState(null)
    const [orders, setOrders] = useState([])
    const [ordersLoading, setOrdersLoading] = useState(true)
    const [selectedOrder, setSelectedOrder] = useState(null)
    const [showAddrModal, setShowAddrModal] = useState(false)

    const dashboardCardsData = [
        { title: 'Total Products', value: dashboardData?.totalProducts || 0, icon: ShoppingBasketIcon },
        { title: 'Total Earnings', value: currency + (dashboardData?.totalEarnings || 0), icon: CircleDollarSignIcon },
        { title: 'Total Orders', value: dashboardData?.totalOrders || 0, icon: TagsIcon },
        { title: 'Total Ratings', value: dashboardData?.ratings?.length || 0, icon: StarIcon },
    ]

    const fetchDashboardData = async () => {
        //simulate fetch with dummy data
        try {
            const token = await getToken()
        //make the api call using axios
        const {data} = await axios.get("/api/store/dashboard", {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
        setDashboardData(data.dashboardData)
        setStoreInfo(data.store || null)
        
        } catch (error) {
            toast.error(error?.response?.data?.message || error.message)
        }
        setLoading(false)
    }

    const fetchOrders = async () => {
        try {
            const token = await getToken()
            if (!token) {
                setOrdersLoading(false)
                return
            }
            const { data } = await axios.get("/api/store/orders", {
                headers: { Authorization: `Bearer ${token}` }
            })
            setOrders(data.orders || [])
        } catch (error) {
            console.error(error)
        } finally {
            setOrdersLoading(false)
        }
    }

    useEffect(() => {
        fetchDashboardData()
        fetchOrders()
    }, [])

    if (loading) return <Loading />

    return (
        <div className=" text-slate-500 mb-28">
            <div className="flex items-center gap-4">
                {storeInfo?.logo ? (
                    <Image src={storeInfo.logo} alt={storeInfo.name || 'Store logo'} className="w-12 h-12 rounded-full object-cover" width={48} height={48} />
                ) : (
                    <div className="w-12 h-12 rounded-full bg-slate-100" />
                )}
                <div>
                    <h1 className="text-2xl">{storeInfo?.name || 'Seller'} <span className="text-slate-800 font-medium">Dashboard</span></h1>
                    {storeInfo?.description && <p className="text-sm text-slate-500">{storeInfo.description}</p>}
                </div>
            </div>

            <div className="flex flex-wrap gap-5 my-10 mt-4">
                {
                    dashboardCardsData.map((card, index) => (
                        <div key={index} className="flex items-center gap-11 border border-slate-200 p-3 px-6 rounded-lg">
                            <div className="flex flex-col gap-3 text-xs">
                                <p>{card.title}</p>
                                <b className="text-2xl font-medium text-slate-700">{card.value}</b>
                            </div>
                            <card.icon size={50} className=" w-11 h-11 p-2.5 text-slate-400 bg-slate-100 rounded-full" />
                        </div>
                    ))
                }
            </div>

            <h2>Total Reviews</h2>

            <div className="mt-5">
                {
                    (dashboardData?.ratings || []).map((review, index) => (
                        <div key={index} className="flex max-sm:flex-col gap-5 sm:items-center justify-between py-6 border-b border-slate-200 text-sm text-slate-600 max-w-4xl">
                            <div>
                                <div className="flex gap-3">
                                    <Image src={review.user.image} alt={review.user?.name ? `${review.user.name} avatar` : 'User avatar'} className="w-10 aspect-square rounded-full" width={100} height={100} />
                                    <div>
                                        <p className="font-medium">{review.user.name}</p>
                                        <p className="font-light text-slate-500">{new Date(review.createdAt).toDateString()}</p>
                                    </div>
                                </div>
                                <p className="mt-3 text-slate-500 max-w-xs leading-6">{review.review}</p>
                            </div>
                            <div className="flex flex-col justify-between gap-6 sm:items-end">
                                <div className="flex flex-col sm:items-end">
                                    <p className="text-slate-400">{review.product?.category}</p>
                                    <p className="font-medium">{review.product?.name}</p>
                                    <div className='flex items-center'>
                                        {Array(5).fill('').map((_, index) => (
                                            <StarIcon key={index} size={17} className='text-transparent mt-0.5' fill={review.rating >= index + 1 ? "#00C950" : "#D1D5DB"} />
                                        ))}
                                    </div>
                                </div>
                                <button onClick={() => router.push(`/product/${review.product.id}`)} className="bg-slate-100 px-5 py-2 hover:bg-slate-200 rounded transition-all">View Product</button>
                            </div>
                        </div>
                    ))
                }
            </div>

            <h2 className="mt-10 mb-4">Recent Orders</h2>
            {ordersLoading ? (
                <Loading />
            ) : orders.length === 0 ? (
                <p className="text-sm text-slate-500">No recent orders</p>
            ) : (
                <div className="overflow-x-auto max-w-4xl rounded-md shadow border border-gray-200">
                    <table className="w-full text-sm text-left text-gray-600">
                        <thead className="bg-gray-50 text-gray-700 text-xs uppercase tracking-wider">
                            <tr>
                                <th className="px-4 py-3">#</th>
                                <th className="px-4 py-3">Customer</th>
                                <th className="px-4 py-3">Total</th>
                                <th className="px-4 py-3">Status</th>
                                <th className="px-4 py-3">Date</th>
                                <th className="px-4 py-3">Address</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {orders.slice(0, 8).map((order, i) => (
                                <tr key={order.id} className="hover:bg-gray-50">
                                    <td className="pl-6 text-green-600">{i + 1}</td>
                                    <td className="px-4 py-3">{order.user?.name || '—'}</td>
                                    <td className="px-4 py-3 font-medium text-slate-800">{currency} {order.total}</td>
                                    <td className="px-4 py-3">{order.status}</td>
                                    <td className="px-4 py-3 text-gray-500">{new Date(order.createdAt).toLocaleString()}</td>
                                    <td className="px-4 py-3">
                                        <button onClick={() => { setSelectedOrder(order); setShowAddrModal(true) }} className="text-xs text-slate-500 hover:underline">View</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {showAddrModal && selectedOrder && (
                <AddressViewModal address={selectedOrder.address} onClose={() => setShowAddrModal(false)} />
            )}
        </div>
    )
}