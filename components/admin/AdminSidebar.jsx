'use client'

import { usePathname } from "next/navigation"
import { HomeIcon, ShieldCheckIcon, StoreIcon, TicketPercentIcon, User as UserIcon, SquarePlusIcon, SquarePenIcon, LayoutListIcon, BarChart3, Users } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useAuth } from "@/context/AuthContext"

const AdminSidebar = () => {
    const { user } = useAuth()
    const pathname = usePathname()

    const sidebarLinks = [
        { name: 'Dashboard', href: '/admin', icon: HomeIcon, color: '#0ea5e9' },
        { name: 'Profile', href: '/admin/profile', icon: UserIcon, color: '#7c3aed' },
        { name: 'Add Product', href: '/admin/add-product', icon: SquarePlusIcon, color: '#22c55e' },
        { name: 'Manage Products', href: '/admin/manage-product', icon: SquarePenIcon, color: '#8b5cf6' },
        { name: 'Orders', href: '/admin/orders', icon: LayoutListIcon, color: '#f97316' },
        { name: 'Coupons', href: '/admin/coupons', icon: TicketPercentIcon, color: '#ef4444' },
        { name: 'Analytics', href: '/admin/analytics', icon: BarChart3, color: '#06b6d4' },
        { name: 'Analytics Charts', href: '/admin/analytics-charts', icon: BarChart3, color: '#d946ef' },
        { name: 'Customers', href: '/admin/customers', icon: Users, color: '#f59e0b' },
    ]

    return user ? (
        <div className="hidden md:flex h-full flex-col gap-5 border-r border-slate-200 md:w-56 lg:w-72">
            <div className="flex flex-col gap-3 justify-center items-center pt-8 px-3">
                {user.imageUrl ? (
                    <Image
                        className="w-12 h-12 md:w-14 md:h-14 rounded-full"
                        src={user.imageUrl}
                        alt={user?.fullName ? `${user.fullName} avatar` : 'Admin avatar'}
                        width={80}
                        height={80}
                    />
                ) : (
                    <div className="flex items-center justify-center w-12 h-12 md:w-14 md:h-14 rounded-full bg-orange-500 text-white">
                        <UserIcon size={24} />
                    </div>
                )}
                <p className="text-center text-slate-700 text-xs md:text-sm font-medium line-clamp-2">{user.fullName || user.name}</p>
            </div>

            <div className="max-sm:mt-6">
                {sidebarLinks.map((link, index) => (
                    <Link
                        key={index}
                        href={link.href}
                        className={`relative flex items-center gap-2 md:gap-3 text-slate-500 hover:bg-slate-50 p-2 md:p-2.5 transition text-xs md:text-sm ${pathname === link.href ? 'bg-slate-100 md:text-slate-600' : ''}`}
                    >
                        <link.icon size={16} className="md:w-5 md:h-5 md:ml-3 flex-shrink-0" style={{ color: link.color }} />
                        <p className="max-md:hidden">{link.name}</p>
                        {pathname === link.href && <span className="absolute right-0 top-1.5 bottom-1.5 w-0.5 md:w-1.5 rounded-l" style={{ backgroundColor: link.color }}></span>}
                    </Link>
                ))}
            </div>
        </div>
    ) : null
}

export default AdminSidebar
