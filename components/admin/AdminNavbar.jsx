'use client'

import Link from "next/link"
import { useAuth } from "@/context/AuthContext"
import { Menu } from "lucide-react"


const AdminNavbar = ({ onMenuClick }) => {
//let's return the admin
const { user, signOut } = useAuth()

    return (
        <div className="flex items-center justify-between px-12 py-3 border-b border-slate-200 transition-all">
            <div className="flex items-center gap-4">
                <button onClick={onMenuClick} className="p-2 hover:bg-slate-100 rounded-md" aria-label="Open menu">
                    <Menu size={24} />
                </button>
                <Link href="/" className="relative text-5xl md:text-6xl font-semibold text-slate-700">
                    <span className="text-red-600">jees</span>cage<span className="text-red-600 text-6xl md:text-7xl leading-0">.</span>
                    <p className="absolute text-xs font-semibold -top-1 -right-13 px-3 p-0.5 rounded-full flex items-center gap-2 text-white bg-red-600">
                        Admin
                    </p>
                </Link>
            </div>
            <div className="flex items-center gap-3">
                <p>Hi, {user?.firstName || user?.fullName?.split(' ')[0] || 'Admin'}</p>
                <button onClick={signOut} className="text-xs text-slate-700 hover:text-orange-600">Sign Out</button>
            </div>
        </div>
    )
}

export default AdminNavbar