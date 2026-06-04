'use client'
import { PackageIcon, Search, ShoppingCart, MapPin, Heart, Home, Grid } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useAuth } from "@/context/AuthContext";
import { useSidebar } from "@/context/SidebarContext";
import logo from "@/app/logo.jpg";
import Drawer from './Drawer'
import "./Navbar.css";

const Navbar = () => {
    const { user, signOut } = useAuth();
    const router = useRouter();
    const pathname = usePathname();
    const { sidebarOpen, setSidebarOpen } = useSidebar()

    const [search, setSearch] = useState('')
    const [cartPulse, setCartPulse] = useState(false)
    const [isMobile, setIsMobile] = useState(true)
    const cartCount = useSelector(state => state.cart.total)
    const wishlistCount = useSelector(state => state.wishlist.total)
    const [drawerOpen, setDrawerOpen] = useState(false)
    const [showLocationDropdown, setShowLocationDropdown] = useState(false)

    const getInitials = (name) => {
        if (!name) return 'U'
        const parts = name.trim().split(' ').filter(Boolean)
        if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
        return (parts[0][0] + parts[1][0]).toUpperCase()
    }

    useEffect(() => {
        const handleResize = () => {
            const mobile = window.innerWidth < 768
            setIsMobile(mobile)
        }
        handleResize()
        window.addEventListener('resize', handleResize)
        return () => window.removeEventListener('resize', handleResize)
    }, [])

    useEffect(() => {
        if (cartCount > 0) {
            setCartPulse(true)
            const timer = setTimeout(() => setCartPulse(false), 600)
            return () => clearTimeout(timer)
        }
    }, [cartCount])

    const handleSearch = (e) => {
        e.preventDefault()
        router.push(`/search?q=${search}`)
    }

    const handleOpenSignIn = () => {
        router.push('/auth')
    }

    return (
        <nav className="relative bg-white border-b border-gray-200">
            <div className="w-full px-2 sm:px-4 lg:px-8">
                <div className="flex items-center justify-between gap-1 sm:gap-3 lg:gap-6 py-2.5 sm:py-3 max-w-full">
                    
                    {/* Left: Hamburger + Logo */}
                    <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0 min-w-0">
                        <button 
                            aria-label="Open menu" 
                            onClick={() => setDrawerOpen(true)} 
                            className="p-1.5 sm:p-2 rounded-md hover:bg-gray-100 flex-shrink-0"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </button>
                        
                        <Link href="/" className="flex items-center gap-1 sm:gap-2 flex-shrink-0 min-w-0">
                            <div className="w-7 h-7 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-full overflow-hidden border-2 border-red-600 shadow hidden sm:flex items-center justify-center flex-shrink-0">
                                <Image 
                                    src={logo} 
                                    alt="Jeescage Logo" 
                                    width={40}
                                    height={40}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <span className="font-bold text-black text-lg sm:text-3xl md:text-4xl whitespace-nowrap">
                                jees<span className="text-amber-700">cage</span>
                            </span>
                        </Link>
                    </div>
                    {/* Center: Search Bar - Always expanded on mobile, responsive on larger screens */}
                    <div className="flex-1 min-w-0 max-w-xs mx-auto md:max-w-sm md:ml-auto">
                        <form onSubmit={handleSearch} className="flex items-center gap-1 sm:gap-2 bg-white border-2 border-gray-200 rounded-lg px-2 sm:px-3 py-1.5 sm:py-2 hover:border-orange-400 focus-within:border-orange-500 transition-all">
                            <Search size={16} className="text-gray-400 flex-shrink-0 sm:w-5 sm:h-5 hidden sm:block" />
                            <input 
                                className="flex-1 bg-transparent outline-none placeholder-gray-500 text-gray-700 text-xs sm:text-sm" 
                                type="text" 
                                placeholder="Search..." 
                                value={search} 
                                onChange={(e) => setSearch(e.target.value)}
                                autoFocus={isMobile}
                            />
                            <button 
                                type="submit"
                                className="bg-orange-500 hover:bg-orange-600 text-white px-2 sm:px-3 py-1 rounded-md flex-shrink-0 transition-all"
                            >
                                <Search size={16} className="sm:w-5 sm:h-5" />
                            </button>
                        </form>
                    </div>


                    {/* Right: Location + Orders + Wishlist + Cart + User */}
                    <div className="flex items-center gap-1 sm:gap-2 lg:gap-3 flex-shrink-0">
                        
                        {/* Location Dropdown - hidden on small screens */}
                        <div className="hidden lg:block relative">
                            <button 
                                onClick={() => setShowLocationDropdown(!showLocationDropdown)}
                                className="flex items-center gap-2 text-gray-700 hover:text-orange-600 transition-colors px-1.5 lg:px-2 py-2 text-xs lg:text-sm whitespace-nowrap"
                            >
                                <MapPin size={16} className="lg:w-5 lg:h-5" />
                                <div className="text-left hidden xl:block">
                                    <div className="text-xs text-gray-600">Deliver to</div>
                                    <div className="font-semibold text-gray-900 text-xs">Your Location</div>
                                </div>
                            </button>
                            {showLocationDropdown && (
                                <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg p-3 z-50">
                                    <p className="text-sm text-gray-600 mb-3">Select your location</p>
                                    <input 
                                        type="text" 
                                        placeholder="Enter your location" 
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                    />
                                </div>
                            )}
                        </div>

                        {/* Home - hidden on mobile */}
                        <Link 
                            href="/"
                            className="hidden sm:flex flex-col items-center justify-center text-gray-700 hover:text-white hover:bg-green-600 bg-gray-50 rounded-lg px-1.5 sm:px-2 py-1.5 sm:py-2 text-xs transition-all duration-200 transform hover:scale-110 hover:shadow-md active:scale-95 flex-shrink-0"
                            title="Home"
                        >
                            <Home size={18} className="sm:w-5 sm:h-5" />
                            <span className="font-semibold text-[10px] sm:text-xs mt-0.5">Home</span>
                        </Link>

                        {/* Categories */}
                        <Link 
                            href="/category"
                            className="hidden md:flex flex-col items-center justify-center text-gray-700 hover:text-white hover:bg-purple-600 bg-gray-50 rounded-lg px-1.5 md:px-2 py-1.5 md:py-2 text-xs transition-all duration-200 transform hover:scale-110 hover:shadow-md active:scale-95 flex-shrink-0"
                            title="Categories"
                        >
                            <Grid size={18} className="md:w-5 md:h-5" />
                            <span className="font-semibold text-[10px] md:text-xs mt-0.5">Categories</span>
                        </Link>

                        {/* Orders - hidden on mobile */}
                        <Link 
                            href="/orders"
                            className="hidden sm:flex flex-col items-center justify-center text-gray-700 hover:text-white hover:bg-blue-600 bg-gray-50 rounded-lg px-1.5 sm:px-2 py-1.5 sm:py-2 text-xs transition-all duration-200 transform hover:scale-110 hover:shadow-md active:scale-95 flex-shrink-0"
                            title="Orders"
                        >
                            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <span className="font-semibold text-[10px] sm:text-xs mt-0.5">Orders</span>
                        </Link>

                        {/* Wishlist - hidden on mobile */}
                        <Link 
                            href="/wishlist"
                            className="relative hidden sm:flex flex-col items-center justify-center text-gray-700 hover:text-white hover:bg-red-600 bg-gray-50 rounded-lg px-1.5 sm:px-2 py-1.5 sm:py-2 text-xs transition-all duration-200 transform hover:scale-110 hover:shadow-md active:scale-95 flex-shrink-0"
                            title="Wishlist"
                        >
                            <Heart size={18} className="sm:w-5 sm:h-5" />
                            <span className="font-semibold text-[10px] sm:text-xs mt-0.5">Wishlist</span>
                            {wishlistCount > 0 && (
                                <span className={`absolute -top-1 -right-1 text-[8px] sm:text-[10px] text-white bg-red-600 w-4 h-4 sm:w-5 sm:h-5 rounded-full flex items-center justify-center font-bold shadow-lg`}>
                                    {wishlistCount}
                                </span>
                            )}
                        </Link>

                        {/* Cart - hidden on mobile */}
                        <Link 
                            href="/cart"
                            className="relative hidden sm:flex flex-col items-center justify-center text-gray-700 hover:text-white hover:bg-orange-600 bg-gray-50 rounded-lg px-1.5 sm:px-2 py-1.5 sm:py-2 text-xs transition-all duration-200 transform hover:scale-110 hover:shadow-md active:scale-95 flex-shrink-0"
                            title="Cart"
                        >
                            <ShoppingCart size={18} className="sm:w-5 sm:h-5" />
                            <span className="font-semibold text-[10px] sm:text-xs mt-0.5">Cart</span>
                            {cartCount > 0 && (
                                <span className={`absolute -top-1 -right-1 text-[8px] sm:text-[10px] text-white bg-red-600 w-4 h-4 sm:w-5 sm:h-5 rounded-full flex items-center justify-center font-bold shadow-lg ${cartPulse ? 'cart-badge-pulse' : 'cart-badge-bounce'}`}>
                                    {cartCount}
                                </span>
                            )}
                        </Link>

                        {/* User Profile / Login */}
                        <div className="flex items-center gap-2 ml-1 px-1.5 sm:px-2 py-1.5 sm:py-2">
                            {user ? (
                                <>
                                    <Link href="/profile" className="flex items-center gap-2 rounded-full bg-slate-100 px-3 py-2 hover:bg-slate-200 transition-all">
                                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-orange-600 text-xs font-semibold uppercase text-white">
                                            {getInitials(user.fullName || user.name)}
                                        </div>
                                        <div className="hidden sm:flex flex-col text-left">
                                            <span className="text-[10px] text-gray-500">Hello,</span>
                                            <span className="font-semibold text-gray-900 text-sm">{user.firstName || user.fullName || user.name}</span>
                                        </div>
                                    </Link>
                                    <button
                                        onClick={signOut}
                                        className="bg-gray-100 hover:bg-gray-200 text-slate-700 px-3 py-2 rounded-lg text-xs sm:text-sm transition-all"
                                    >
                                        Sign Out
                                    </button>
                                </>
                            ) : (
                                <button 
                                    onClick={handleOpenSignIn}
                                    className="bg-orange-500 hover:bg-orange-600 text-white px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg font-semibold text-xs sm:text-sm transition-all flex-shrink-0 whitespace-nowrap"
                                >
                                    Login
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            <Drawer 
                open={drawerOpen} 
                onClose={() => setDrawerOpen(false)} 
                isSidebarMode={false}
                isSidebarOpen={sidebarOpen}
                onSidebarToggle={() => setSidebarOpen(!sidebarOpen)}
            />
        </nav>
    )
}

export default Navbar