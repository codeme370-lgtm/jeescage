'use client'

import { useEffect, useState } from 'react'
import axios from 'axios'
import { toast } from 'react-hot-toast'
import Image from 'next/image'
import Loading from '@/components/Loading'
import { TrendingUp, TrendingDown, Users, ShoppingCart, DollarSign, User } from 'lucide-react'

export default function AdminCustomersAnalytics() {
    const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || 'GHS'

    const [loading, setLoading] = useState(true)
    const [customers, setCustomers] = useState([])
    const [sortBy, setSortBy] = useState('spending') // 'spending', 'quantity', 'visits'
    const [topCount, setTopCount] = useState(10)
    const [displayData, setDisplayData] = useState([])

    const fetchCustomerAnalytics = async () => {
        try {
            setLoading(true)
            const { data } = await axios.get('/api/admin/customers', { withCredentials: true })
            setCustomers(data.allCustomers)
        } catch (error) {
            toast.error(error?.response?.data?.message || 'Failed to fetch customer analytics')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchCustomerAnalytics()
    }, [])

    useEffect(() => {
        let sorted = [...customers]

        if (sortBy === 'spending') {
            sorted = sorted.sort((a, b) => b.totalSpent - a.totalSpent)
        } else if (sortBy === 'quantity') {
            sorted = sorted.sort((a, b) => b.totalQuantity - a.totalQuantity)
        } else if (sortBy === 'visits') {
            sorted = sorted.sort((a, b) => b.totalOrders - a.totalOrders)
        }

        setDisplayData(sorted.slice(0, topCount))
    }, [customers, sortBy, topCount])

    if (loading) return <Loading />

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl text-slate-500 mb-2">
                    Customer <span className="text-slate-800 font-medium">Analytics</span>
                </h1>
                <p className="text-sm text-slate-600">Total Active Customers: {customers.length}</p>
            </div>

            {/* Controls */}
            <div className="bg-white rounded-lg shadow p-4 flex flex-col md:flex-row gap-4 md:gap-6 items-start md:items-center">
                <div className="flex flex-col">
                    <label className="text-sm font-medium text-slate-700 mb-1">Sort By</label>
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="spending">Highest Spending</option>
                        <option value="quantity">Most Products Bought</option>
                        <option value="visits">Most Visited (Orders)</option>
                    </select>
                </div>

                <div className="flex flex-col">
                    <label className="text-sm font-medium text-slate-700 mb-1">Show Top</label>
                    <input
                        type="number"
                        min="1"
                        max="100"
                        value={topCount}
                        onChange={(e) => setTopCount(Math.max(1, parseInt(e.target.value) || 10))}
                        className="px-3 py-2 border border-slate-300 rounded-md text-sm w-20 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                <div className="flex-1">
                    <p className="text-sm text-slate-600">
                        Showing <span className="font-medium">{displayData.length}</span> of{' '}
                        <span className="font-medium">{customers.length}</span> customers
                    </p>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg shadow p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-slate-600 mb-1">Total Customers</p>
                            <p className="text-2xl font-bold text-slate-800">{customers.length}</p>
                        </div>
                        <Users className="text-blue-500" size={32} />
                    </div>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg shadow p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-slate-600 mb-1">Total Revenue</p>
                            <p className="text-2xl font-bold text-slate-800">
                                {currency} {customers.reduce((sum, c) => sum + c.totalSpent, 0).toLocaleString('en-US', { maximumFractionDigits: 0 })}
                            </p>
                        </div>
                        <DollarSign className="text-green-500" size={32} />
                    </div>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg shadow p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-slate-600 mb-1">Total Products Sold</p>
                            <p className="text-2xl font-bold text-slate-800">
                                {customers.reduce((sum, c) => sum + c.totalQuantity, 0).toLocaleString()}
                            </p>
                        </div>
                        <ShoppingCart className="text-purple-500" size={32} />
                    </div>
                </div>
            </div>

            {/* Customers Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200">
                                <th className="px-4 py-3 text-left font-semibold text-slate-700">Customer</th>
                                <th className="px-4 py-3 text-left font-semibold text-slate-700">Email</th>
                                <th className="px-4 py-3 text-right font-semibold text-slate-700">Orders</th>
                                <th className="px-4 py-3 text-right font-semibold text-slate-700">Total Spent</th>
                                <th className="px-4 py-3 text-right font-semibold text-slate-700">Qty Bought</th>
                                <th className="px-4 py-3 text-right font-semibold text-slate-700">Avg Order</th>
                                <th className="px-4 py-3 text-left font-semibold text-slate-700">Joined</th>
                            </tr>
                        </thead>
                        <tbody>
                            {displayData.map((customer, index) => (
                                <tr key={customer.id} className="border-b border-slate-200 hover:bg-slate-50 transition-colors">
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-700">
                                                {index + 1}
                                            </div>
                                            {customer.image ? (
                                                <Image
                                                    src={customer.image}
                                                    alt={customer.name}
                                                    width={32}
                                                    height={32}
                                                    className="rounded-full"
                                                />
                                            ) : (
                                                <div className="w-8 h-8 rounded-full bg-slate-300 flex items-center justify-center">
                                                    <User size={16} className="text-slate-600" />
                                                </div>
                                            )}
                                            <span className="font-medium text-slate-800">{customer.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-slate-600 text-xs md:text-sm">{customer.email}</td>
                                    <td className="px-4 py-3 text-right">
                                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">
                                            {customer.totalOrders}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-right font-semibold text-slate-800">
                                        {currency} {customer.totalSpent.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs font-medium">
                                            {customer.totalQuantity}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-right text-slate-600">
                                        {currency} {customer.avgOrderValue.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                                    </td>
                                    <td className="px-4 py-3 text-xs text-slate-600">
                                        {new Date(customer.joinDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {displayData.length === 0 && (
                    <div className="flex justify-center items-center py-12">
                        <p className="text-slate-600">No customers found</p>
                    </div>
                )}
            </div>

            {/* Bottom Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white rounded-lg shadow p-4">
                    <div className="flex items-center gap-2 mb-3">
                        <TrendingUp className="text-green-500" size={20} />
                        <h3 className="font-semibold text-slate-800">Average Metrics</h3>
                    </div>
                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span className="text-slate-600">Avg Spending per Customer:</span>
                            <span className="font-medium text-slate-800">
                                {currency} {(customers.length > 0 ? customers.reduce((sum, c) => sum + c.totalSpent, 0) / customers.length : 0).toLocaleString('en-US', { maximumFractionDigits: 0 })}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-slate-600">Avg Products per Customer:</span>
                            <span className="font-medium text-slate-800">
                                {(customers.length > 0 ? customers.reduce((sum, c) => sum + c.totalQuantity, 0) / customers.length : 0).toLocaleString('en-US', { maximumFractionDigits: 0 })}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-slate-600">Avg Orders per Customer:</span>
                            <span className="font-medium text-slate-800">
                                {(customers.length > 0 ? customers.reduce((sum, c) => sum + c.totalOrders, 0) / customers.length : 0).toLocaleString('en-US', { maximumFractionDigits: 1 })}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow p-4">
                    <div className="flex items-center gap-2 mb-3">
                        <TrendingDown className="text-red-500" size={20} />
                        <h3 className="font-semibold text-slate-800">Top Customer Metrics</h3>
                    </div>
                    {customers.length > 0 ? (
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-slate-600">Highest Spender:</span>
                                <span className="font-medium text-slate-800">{currency} {Math.max(...customers.map(c => c.totalSpent)).toLocaleString('en-US', { maximumFractionDigits: 0 })}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-600">Most Products Buyer:</span>
                                <span className="font-medium text-slate-800">{Math.max(...customers.map(c => c.totalQuantity))} units</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-600">Most Orders:</span>
                                <span className="font-medium text-slate-800">{Math.max(...customers.map(c => c.totalOrders))} orders</span>
                            </div>
                        </div>
                    ) : (
                        <p className="text-slate-600 text-sm">No customer data available</p>
                    )}
                </div>
            </div>
        </div>
    )
}
