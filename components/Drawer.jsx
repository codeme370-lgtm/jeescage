"use client"
import React, { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { X, ShoppingCart, Zap, Flame, TrendingUp, Sparkles, UtensilsCrossed, Heart, Smartphone, Shirt, Home, Dumbbell, ShoppingBag, Baby, Car, BookOpen, Grid, ChevronLeft, Package } from 'lucide-react'
import { useSelector } from 'react-redux'
import logo from '@/app/logo.jpg'

const Drawer = ({ open, onClose, isSidebarMode = false, isSidebarOpen = true, onSidebarToggle = () => {} }) => {
    const cartCount = useSelector(state => state.cart.total)
    const dbCategories = useSelector(state => state.category.list)

    // Default categories if db is empty
    const defaultCategories = [
        { name: 'Electronics', icon: Smartphone },
        { name: 'Fashion', icon: Shirt },
        { name: 'Home & Kitchen', icon: Home },
        { name: 'Beauty & Health', icon: Heart },
    ]

    // Build categories from database with icons
    const categoryIcons = {
        'electronics': Smartphone,
        'fashion': Shirt,
        'home': Home,
        'kitchen': Home,
        'health': Heart,
        'beauty': Heart,
        'sports': Dumbbell,
        'outdoors': Dumbbell,
        'groceries': ShoppingBag,
        'baby': Baby,
        'toys': Baby,
        'automotive': Car,
        'car': Car,
        'books': BookOpen,
    }

    const getIconForCategory = (categoryName) => {
        const lowerName = categoryName.toLowerCase()
        for (const [key, icon] of Object.entries(categoryIcons)) {
            if (lowerName.includes(key)) return icon
        }
        return Smartphone // default icon
    }

    const categories = dbCategories && dbCategories.length > 0 
        ? dbCategories.map(cat => ({
            name: cat.name,
            icon: getIconForCategory(cat.name),
            href: `/category`
          }))
        : defaultCategories.map(cat => ({
            ...cat,
            href: `/category`
          }))

    const quickLinks = [
        { name: 'Browse All Categories', icon: Grid, href: '/category' },
        { name: 'Super Deals', icon: Zap, href: '/shop?sort=deals' },
        { name: 'Flash Sale', icon: Flame, href: '/shop?section=flash' },
        { name: 'Best Sellers', icon: TrendingUp, href: '/shop?sort=bestsellers' },
        { name: 'New Arrivals', icon: Sparkles, href: '/shop?sort=new' },
    ]

    return (
        <>
            {/* Mobile Drawer Mode */}
            {!isSidebarMode && (
                <>
                    {/* Overlay */}
                    <div className={`fixed inset-0 bg-black/40 transition-opacity ${open ? 'opacity-100 visible' : 'opacity-0 invisible'}`} onClick={onClose} style={{ zIndex: 40 }} />

                    {/* Drawer panel (left side) */}
                    <aside className={`fixed top-0 left-0 h-full w-80 sm:w-96 bg-white shadow-2xl transform transition-transform duration-300 ${open ? 'translate-x-0' : '-translate-x-full'}`} aria-hidden={!open} style={{ zIndex: 50 }}>
                        <DrawerContent onClose={onClose} categories={categories} quickLinks={quickLinks} />
                    </aside>
                </>
            )}

            {/* Sidebar Mode (Medium+ screens) */}
            {isSidebarMode && (
                <>
                    {/* Sidebar Header (Top Logo) */}
                    <div className={`hidden md:flex fixed left-0 top-0 h-20 bg-white border-b border-gray-200 flex items-center transition-all duration-300 z-50 ${isSidebarOpen ? 'w-80' : 'w-20'}`}>
                        <div className={`flex items-center gap-3 p-4 w-full ${isSidebarOpen ? '' : 'justify-center'}`}>
                            <div className={`w-10 h-10 rounded-full overflow-hidden border-2 border-red-600 shadow flex-shrink-0`}>
                                <Image src={logo} alt="jeescage" width={40} height={40} className="object-cover w-full h-full" />
                            </div>
                            {isSidebarOpen && (
                                <div className="text-lg md:text-2xl font-bold text-black whitespace-nowrap">
                                    jees<span className="text-amber-700">cage</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Sidebar */}
                    <aside className={`hidden md:flex fixed left-0 top-20 h-[calc(100vh-80px)] bg-white border-r border-gray-200 transition-all duration-300 flex-col ${isSidebarOpen ? 'w-80' : 'w-20'}`} style={{ zIndex: 40 }}>
                        {/* Minimize button */}
                        <button
                            onClick={onSidebarToggle}
                            className={`absolute p-1.5 hover:bg-gray-100 rounded-lg transition-all text-gray-700 top-6 right-2 z-50`}
                            aria-label="Toggle sidebar"
                        >
                            <ChevronLeft size={20} className={`transform transition-transform ${!isSidebarOpen ? 'rotate-180' : ''}`} />
                        </button>

                        {isSidebarOpen ? (
                            <DrawerContent onClose={() => {}} categories={categories} quickLinks={quickLinks} isSidebar={true} />
                        ) : (
                            /* Collapsed sidebar icons */
                            <div className="w-full p-4 overflow-y-auto flex flex-col items-center gap-4">
                                {/* Category icons */}
                                {categories.map((category, idx) => {
                                    const Icon = category.icon
                                    return (
                                        <Link key={idx} href={category.href} title={category.name} className="p-2 hover:bg-gray-100 rounded-lg transition text-gray-700">
                                            <Icon size={20} />
                                        </Link>
                                    )
                                })}
                                <div className="w-full h-px bg-gray-200 my-2" />
                                {/* Quick links icons */}
                                {quickLinks.map((link, idx) => {
                                    const Icon = link.icon
                                    return (
                                        <Link key={idx} href={link.href} title={link.name} className="p-2 hover:bg-gray-100 rounded-lg transition text-gray-700">
                                            <Icon size={20} />
                                        </Link>
                                    )
                                })}
                            </div>
                        )}
                    </aside>

                    {/* Overlay for mobile drawer when open */}
                    {open && (
                        <div className={`fixed inset-0 bg-black/40 transition-opacity md:hidden`} onClick={onClose} style={{ zIndex: 40 }} />
                    )}
                </>
            )}
        </>
    )
}

function DrawerContent({ onClose, categories, quickLinks, isSidebar = false }) {
    const cartCount = useSelector(state => state.cart.total)
    const wishlistCount = useSelector(state => state.wishlist.total)
    
    // Navigation items for mobile (Home, Orders, Wishlist, Cart)
    const mobileNav = [
        { name: 'Home', icon: Home, href: '/', color: 'green' },
        { name: 'Orders', icon: Package, href: '/orders', color: 'blue' },
        { name: 'Wishlist', icon: Heart, href: '/wishlist', color: 'red', badge: wishlistCount > 0 ? wishlistCount : null },
        { name: 'Cart', icon: ShoppingCart, href: '/cart', color: 'orange', badge: cartCount > 0 ? cartCount : null },
    ]
    
    return (
        <div className={`p-4 h-full flex flex-col overflow-y-auto ${isSidebar ? 'pt-6' : ''}`}>
            {/* Header with logo and close button */}
            {!isSidebar && (
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-red-600 shadow">
                            <Image src={logo} alt="jeescage" width={40} height={40} className="object-cover w-full h-full" />
                        </div>
                        <div>
                            <div className="text-base md:text-lg font-bold text-black">jees<span className="text-amber-700">cage</span></div>
                            <div className="text-xs text-gray-600">Shop Smarter</div>
                        </div>
                    </div>
                    <button onClick={onClose} aria-label="Close menu" className="p-2 rounded-md hover:bg-gray-100 text-gray-700">
                        <X size={24} />
                    </button>
                </div>
            )}

            {/* Mobile Navigation Section - Only visible on mobile drawer */}
            {!isSidebar && (
                <div className="mb-6">
                    <div className="grid grid-cols-4 gap-2">
                        {mobileNav.map((item, idx) => {
                            const Icon = item.icon
                            const bgColorClass = `hover:bg-${item.color}-600`
                            return (
                                <Link key={idx} href={item.href} onClick={onClose}>
                                    <div className={`relative flex flex-col items-center justify-center p-3 rounded-lg bg-gray-50 hover:bg-${item.color}-600 hover:text-white transition-all text-gray-700`}>
                                        <Icon size={20} className="mb-1" />
                                        <span className="text-[10px] font-semibold text-center leading-tight">{item.name}</span>
                                        {item.badge && (
                                            <span className="absolute -top-2 -right-2 text-[8px] bg-red-600 text-white w-5 h-5 rounded-full flex items-center justify-center font-bold shadow-lg">
                                                {item.badge}
                                            </span>
                                        )}
                                    </div>
                                </Link>
                            )
                        })}
                    </div>
                </div>
            )}

            {/* Categories Section */}
            <div className="mb-6">
                <div className="flex items-center justify-between mb-3 px-2">
                    <h3 className="text-lg font-bold text-gray-900">Categories</h3>
                    {!isSidebar && (
                        <Link href="/category" onClick={onClose} className="text-xs font-semibold text-orange-600 hover:text-orange-700 transition">
                            View All
                        </Link>
                    )}
                </div>
                <nav className="space-y-2">
                    {categories.map((category, idx) => {
                        const Icon = category.icon
                        return (
                            <Link key={idx} href={`/category?category=${encodeURIComponent(category.name)}`} onClick={onClose} title={category.name}>
                                <div className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition text-gray-800 font-medium">
                                    <div className="flex items-center gap-3">
                                        <Icon size={20} className="text-gray-700" />
                                        <span>{category.name}</span>
                                    </div>
                                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </div>
                            </Link>
                        )
                    })}
                </nav>
            </div>

            {/* Quick Links Section */}
            <div className="mb-6">
                <h3 className="text-lg font-bold text-gray-900 mb-3 px-2">Quick Links</h3>
                <nav className="space-y-2">
                    {quickLinks.map((link, idx) => {
                        const Icon = link.icon
                        return (
                            <Link key={idx} href={link.href} onClick={onClose}>
                                <div className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition text-gray-800 font-medium">
                                    <div className="flex items-center gap-3">
                                        <Icon size={20} className="text-gray-700" />
                                        <span>{link.name}</span>
                                    </div>
                                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </div>
                            </Link>
                        )
                    })}
                </nav>
            </div>

            {/* Spacer */}
            <div className="flex-1" />
        </div>
    )
}

export default Drawer
