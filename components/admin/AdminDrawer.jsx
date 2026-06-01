'use client'
import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { X, Home, Store, ShieldCheck, TicketPercent, ShoppingBag } from 'lucide-react'

const AdminDrawer = ({ open, onClose, userImage, userName }) => {
    const drawerLinks = [
        { name: 'Dashboard', href: '/admin', icon: Home },
        { name: 'Coupons', href: '/admin/coupons', icon: TicketPercent },
        { name: 'Back to Shop', href: '/shop', icon: ShoppingBag },
    ]

    return (
        <>
            {/* Overlay */}
            <div 
                className={`fixed inset-0 bg-black/40 transition-opacity ${open ? 'opacity-100 visible' : 'opacity-0 invisible'}`} 
                onClick={onClose} 
                style={{ zIndex: 40 }} 
            />

            {/* Drawer panel (left side) */}
            <aside 
                className={`fixed top-0 left-0 h-full w-80 sm:w-96 bg-white shadow-2xl transform transition-transform duration-300 backdrop-blur-sm ${open ? 'translate-x-0' : '-translate-x-full'}`} 
                aria-hidden={!open} 
                style={{ zIndex: 50 }}
            >
                <div className="p-4 h-full flex flex-col">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-red-600 shadow">
                                <Image 
                                    src={userImage || '/favicon.ico'} 
                                    alt={userName || 'Admin'} 
                                    width={48} 
                                    height={48} 
                                    className="object-cover w-full h-full" 
                                />
                            </div>
                            <div>
                                <div className="text-sm font-semibold text-slate-700">{userName || 'Admin'}</div>
                                <div className="text-xs text-slate-500">Admin Panel</div>
                            </div>
                        </div>
                        <button 
                            onClick={onClose} 
                            aria-label="Close menu" 
                            className="p-2 rounded-md hover:bg-slate-100 text-slate-700"
                        >
                            <X />
                        </button>
                    </div>

                    <nav className="flex-1 overflow-auto border-t border-slate-200">
                        <ul className="space-y-2 pt-4">
                            {drawerLinks.map((link, index) => (
                                <li key={index}>
                                    <Link 
                                        href={link.href} 
                                        className="flex items-center gap-3 p-3 rounded-md hover:bg-slate-100 text-slate-700 font-medium transition"
                                        onClick={onClose}
                                    >
                                        <link.icon size={20} /> 
                                        <span>{link.name}</span>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </nav>

                    <div className="mt-4 space-y-2">
                        <Link 
                            href="/" 
                            className="block w-full text-center px-4 py-2 bg-red-600 text-white rounded-md font-semibold hover:bg-red-700 transition"
                        >
                            Go to Homepage
                        </Link>
                    </div>
                </div>
            </aside>
        </>
    )
}

export default AdminDrawer
