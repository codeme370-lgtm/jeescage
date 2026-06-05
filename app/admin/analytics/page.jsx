'use client'

import { useEffect, useState } from "react"
import { toast } from "react-hot-toast"
import axios from "axios"
import Loading from "@/components/Loading"
import Image from "next/image"
import { TrendingUp, TrendingDown, Star, ShoppingCart, DollarSign } from "lucide-react"

export default function AdminAnalytics() {
    const [loading, setLoading] = useState(true)
    const [analytics, setAnalytics] = useState({
        topQuantity: [],
        bottomQuantity: [],
        topRevenue: [],
        bottomRevenue: [],
        topRating: [],
        bottomRating: [],
    })
    const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || 'GHS'

    const fetchAnalytics = async () => {
        try {
            const { data } = await axios.get('/api/admin/analytics', { withCredentials: true })
            setAnalytics(data)
        } catch (error) {
            toast.error(error?.response?.data?.error || "Failed to fetch analytics")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchAnalytics()
    }, [])

    if (loading) return <Loading />

    const ProductTable = ({ data, metric = "quantity" }) => (
        <div className="overflow-x-auto rounded-lg border border-slate-200 shadow">
            <table className="w-full text-sm text-left text-slate-700">
                <thead className="bg-slate-50 text-slate-800 uppercase tracking-wider text-xs font-semibold">
                    <tr>
                        <th className="px-4 py-3">Sr. No.</th>
                        <th className="px-4 py-3">Product</th>
                        <th className="px-4 py-3">Category</th>
                        {metric === "quantity" && (
                            <>
                                <th className="px-4 py-3">Units Sold</th>
                                <th className="px-4 py-3">Unit Price</th>
                            </>
                        )}
                        {metric === "revenue" && (
                            <>
                                <th className="px-4 py-3">Total Revenue</th>
                                <th className="px-4 py-3">Units Sold</th>
                            </>
                        )}
                        {metric === "rating" && (
                            <>
                                <th className="px-4 py-3">Avg Rating</th>
                                <th className="px-4 py-3">Total Ratings</th>
                            </>
                        )}
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {data.length === 0 ? (
                        <tr>
                            <td colSpan="5" className="px-4 py-6 text-center text-slate-500">
                                No products found
                            </td>
                        </tr>
                    ) : (
                        data.map((product, index) => (
                            <tr key={product.id} className="hover:bg-slate-50 transition">
                                <td className="px-4 py-3 font-medium text-slate-800">{index + 1}</td>
                                <td className="px-4 py-3">
                                    <div className="flex items-center gap-3">
                                        {product.image && (
                                            <Image
                                                src={product.image}
                                                alt={product.name}
                                                width={40}
                                                height={40}
                                                className="rounded object-cover"
                                            />
                                        )}
                                        <span className="truncate max-w-xs">{product.name}</span>
                                    </div>
                                </td>
                                <td className="px-4 py-3 text-slate-600">{product.category}</td>
                                {metric === "quantity" && (
                                    <>
                                        <td className="px-4 py-3 font-semibold text-green-600">{product.totalQuantity}</td>
                                        <td className="px-4 py-3">{currency} {product.price.toFixed(2)}</td>
                                    </>
                                )}
                                {metric === "revenue" && (
                                    <>
                                        <td className="px-4 py-3 font-semibold text-green-600">
                                            {currency} {product.totalRevenue.toLocaleString('en-US', { maximumFractionDigits: 2 })}
                                        </td>
                                        <td className="px-4 py-3">{product.totalQuantity}</td>
                                    </>
                                )}
                                {metric === "rating" && (
                                    <>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-1">
                                                <Star size={16} className="text-yellow-400 fill-yellow-400" />
                                                <span className="font-semibold">{product.avgRating}</span>
                                                <span className="text-xs text-slate-500">/5</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-slate-600">{product.totalRatings}</td>
                                    </>
                                )}
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    )

    return (
        <div className="text-slate-500 mb-28">
            <h1 className="text-2xl text-slate-500 mb-8">
                Product <span className="text-slate-800 font-medium">Analytics</span>
            </h1>

            {/* Quantity Analytics */}
            <div className="space-y-6">
                {/* Top Quantity */}
                <div className="space-y-3">
                    <div className="flex items-center gap-2">
                        <TrendingUp size={20} className="text-green-600" />
                        <h2 className="text-xl font-semibold text-slate-800">
                            Top 10 Products by Quantity Sold
                        </h2>
                    </div>
                    <ProductTable data={analytics.topQuantity} metric="quantity" />
                </div>

                {/* Bottom Quantity */}
                <div className="space-y-3 mt-10">
                    <div className="flex items-center gap-2">
                        <TrendingDown size={20} className="text-red-600" />
                        <h2 className="text-xl font-semibold text-slate-800">
                            Bottom 10 Products by Quantity Sold
                        </h2>
                    </div>
                    <ProductTable data={analytics.bottomQuantity} metric="quantity" />
                </div>

                {/* Top Revenue */}
                <div className="space-y-3 mt-10">
                    <div className="flex items-center gap-2">
                        <DollarSign size={20} className="text-green-600" />
                        <h2 className="text-xl font-semibold text-slate-800">
                            Top 10 Products by Revenue Generated
                        </h2>
                    </div>
                    <ProductTable data={analytics.topRevenue} metric="revenue" />
                </div>

                {/* Bottom Revenue */}
                <div className="space-y-3 mt-10">
                    <div className="flex items-center gap-2">
                        <TrendingDown size={20} className="text-red-600" />
                        <h2 className="text-xl font-semibold text-slate-800">
                            Bottom 10 Products by Revenue Generated
                        </h2>
                    </div>
                    <ProductTable data={analytics.bottomRevenue} metric="revenue" />
                </div>

                {/* Top Rated */}
                <div className="space-y-3 mt-10">
                    <div className="flex items-center gap-2">
                        <Star size={20} className="text-yellow-500 fill-yellow-500" />
                        <h2 className="text-xl font-semibold text-slate-800">
                            Top 10 Rated Products
                        </h2>
                    </div>
                    <ProductTable data={analytics.topRating} metric="rating" />
                </div>

                {/* Bottom Rated */}
                <div className="space-y-3 mt-10">
                    <div className="flex items-center gap-2">
                        <TrendingDown size={20} className="text-red-600" />
                        <h2 className="text-xl font-semibold text-slate-800">
                            Bottom 10 Rated Products (With Ratings)
                        </h2>
                    </div>
                    <ProductTable data={analytics.bottomRating} metric="rating" />
                </div>
            </div>
        </div>
    )
}
