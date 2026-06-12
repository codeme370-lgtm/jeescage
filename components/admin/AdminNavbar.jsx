'use client'

import Link from "next/link"
import { useAuth } from "@/context/AuthContext"
import { Menu, User } from "lucide-react"


const AdminNavbar = ({ onMenuClick }) => {
//let's return the admin
const { user } = useAuth()

    return (
        <div className="flex items-center justify-between gap-2 sm:gap-4 px-4 sm:px-6 lg:px-12 py-3 border-b border-slate-200 transition-all">
            <div className="flex items-center gap-2 sm:gap-4">
                <button onClick={onMenuClick} className="p-2 hover:bg-slate-100 rounded-md md:hidden" aria-label="Open menu">
                    <Menu size={24} />
                </button>
                <Link href="/" className="relative text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-semibold text-slate-700">
                    <span className="text-red-600">jees</span>cage<span className="text-red-600 text-6xl md:text-7xl leading-0">.</span>
                    <p className="absolute text-xs font-semibold -top-1 -right-13 px-3 p-0.5 rounded-full flex items-center gap-2 text-white bg-red-600">
                        Admin
                    </p>
                </Link>
            </div>

            <div className="hidden lg:flex items-center gap-3 flex-wrap justify-end">
                <Link href="/" className="inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold text-white bg-sky-500 hover:bg-sky-600 transition">
                    Home
                </Link>
                <Link href="/category" className="inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold text-white bg-emerald-500 hover:bg-emerald-600 transition">
                    Categories
                </Link>
                <Link href="/shop" className="inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold text-white bg-violet-500 hover:bg-violet-600 transition">
                    Shop
                </Link>
                <Link href="/search" className="inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold text-white bg-orange-500 hover:bg-orange-600 transition">
                    Search
                </Link>
                <Link href="/cart" className="inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold text-white bg-fuchsia-500 hover:bg-fuchsia-600 transition">
                    Cart
                </Link>
                <p className="text-sm font-medium">Hi, {user?.firstName || user?.fullName?.split(' ')[0] || 'Admin'}</p>
                <Link 
                    href="/admin/profile" 
                    className="flex items-center justify-center w-12 h-12 rounded-full bg-purple-600 hover:bg-purple-700 transition text-white shadow-md"
                    aria-label="Go to admin profile"
                >
                    <User size={24} />
                </Link>
            </div>
            
            {/* Mobile profile section */}
            <div className="lg:hidden flex items-center gap-3">
                <p className="text-xs sm:text-sm font-medium">Hi, {user?.firstName || user?.fullName?.split(' ')[0] || 'Admin'}</p>
                <Link 
                    href="/admin/profile" 
                    className="flex items-center justify-center w-10 h-10 rounded-full bg-purple-600 hover:bg-purple-700 transition text-white shadow-md"
                    aria-label="Go to admin profile"
                >
                    <User size={20} />
                </Link>
            </div>
        </div>
    )
}

export default AdminNavbar