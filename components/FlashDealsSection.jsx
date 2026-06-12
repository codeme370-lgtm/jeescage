'use client'
import React, { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { useAuth } from "@/context/AuthContext"
import ProductCard from './ProductCard'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { useSidebar } from '@/context/SidebarContext'
import { useInViewAnimation } from '@/hooks/useInViewAnimation'

const FlashDealsSection = () => {
    const { sidebarOpen } = useSidebar()
    const { user } = useAuth()
    const products = useSelector(state => state.product.list)
    const [timeLeft, setTimeLeft] = useState({ hours: 2, minutes: 15, seconds: 22 })
    const [scrollPos, setScrollPos] = useState(0)
    const [greeting, setGreeting] = useState('')
    
    // Animation on scroll
    const { ref: headerRef, isInView: headerInView } = useInViewAnimation()
    const { ref: gridRef, isInView: gridInView } = useInViewAnimation()

    // Get greeting based on time of day
    useEffect(() => {
        const hour = new Date().getHours()
        let greetingText = ''
        
        if (hour < 12) {
            greetingText = 'Good Morning'
        } else if (hour < 17) {
            greetingText = 'Good Afternoon'
        } else {
            greetingText = 'Good Evening'
        }
        
        setGreeting(greetingText)
    }, [])

    // Countdown timer effect
    useEffect(() => {
        const interval = setInterval(() => {
            setTimeLeft(prev => {
                let { hours, minutes, seconds } = prev
                if (seconds > 0) {
                    seconds--
                } else if (minutes > 0) {
                    minutes--
                    seconds = 59
                } else if (hours > 0) {
                    hours--
                    minutes = 59
                    seconds = 59
                }
                return { hours, minutes, seconds }
            })
        }, 1000)
        return () => clearInterval(interval)
    }, [])

    const scrollContainers = (direction) => {
        const container = document.getElementById('flash-deals-scroll')
        if (container) {
            const scrollAmount = 300
            if (direction === 'left') {
                container.scrollBy({ left: -scrollAmount, behavior: 'smooth' })
            } else {
                container.scrollBy({ left: scrollAmount, behavior: 'smooth' })
            }
        }
    }

    const flashProducts = (() => {
        // Only show one product per category, selecting the latest product per category.
        const latestByCategory = {}
        const sorted = [...products].sort(
            (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        )

        for (const product of sorted) {
            if (!product.category) continue
            if (!latestByCategory[product.category]) {
                latestByCategory[product.category] = product
            }
            if (Object.keys(latestByCategory).length >= 8) break
        }

        return Object.values(latestByCategory)
    })()

    return (
        <div className='w-full bg-white py-6 sm:py-8 px-2 sm:px-4 md:px-8'>
            <div className='max-w-7xl mx-auto'>
                {/* Header - All in one line */}
                <div ref={headerRef} className={`flex flex-wrap items-center justify-between gap-1 sm:gap-1.5 mb-2 sm:mb-3 transition-all duration-700 ${headerInView ? 'animate-fadeInDown' : 'opacity-0 -translate-y-4'}`}>
                    {/* Greeting */}
                    <div className='text-xs sm:text-sm md:text-base font-semibold text-gray-700'>
                        {greeting} {user?.firstName && <span className='text-amber-700 font-bold'>{user.firstName}</span>}
                    </div>

                    {/* Flash Sale Badge */}
                    <div className='bg-red-600 text-white px-2 sm:px-3 md:px-4 py-1 sm:py-1.5 rounded font-bold text-[10px] sm:text-xs md:text-sm shadow-md'>
                        Flash Sale
                    </div>

                    {/* Timer */}
                    <div className='flex items-center gap-1 sm:gap-1.5 bg-gray-900 text-white px-2 sm:px-3 md:px-4 py-1 sm:py-1.5 rounded font-mono text-[9px] sm:text-[10px] md:text-xs shadow-md'>
                        <span className='hidden sm:inline text-[8px] sm:text-[10px]'>Ending in:</span>
                        <span className='font-bold'>{String(timeLeft.hours).padStart(2, '0')}</span>
                        <span>:</span>
                        <span className='font-bold'>{String(timeLeft.minutes).padStart(2, '0')}</span>
                        <span>:</span>
                        <span className='font-bold'>{String(timeLeft.seconds).padStart(2, '0')}</span>
                    </div>

                    {/* View All Link */}
                    <Link href='/shop?section=flash' className='text-red-600 hover:text-red-700 font-semibold text-[10px] sm:text-xs md:text-sm transition-colors whitespace-nowrap'>
                        View All →
                    </Link>
                </div>

                {/* Grid layout for flash deals - responsive */}
                <div ref={gridRef} className={`grid gap-2 sm:gap-3 md:gap-4 transition-all duration-700 ${gridInView ? 'animate-fadeInUp' : 'opacity-0 translate-y-8'} ${sidebarOpen ? 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4' : 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5'}`}
                    {flashProducts.map((product, idx) => (
                        <div key={product.id || idx} className='group relative'>
                            {/* Discount badge */}
                            {product.mrp && product.price && (
                                <div className='absolute top-1 left-1 sm:top-2 sm:left-2 bg-red-600 text-white px-1.5 sm:px-2 py-0.5 sm:py-1 rounded text-[9px] sm:text-xs font-bold z-10 shadow-md'>
                                    {Math.round(((product.mrp - product.price) / product.mrp) * 100)}% OFF
                                </div>
                            )}
                            
                            {/* Sold count badge (if available) */}
                            {product.sold && (
                                <div className='absolute bottom-1 right-1 sm:bottom-2 sm:right-2 bg-gray-800 text-white text-[8px] sm:text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded z-10 opacity-80'>
                                    {product.sold > 1000 ? (product.sold / 1000).toFixed(1) : product.sold}k sold
                                </div>
                            )}
                            
                            <ProductCard product={product} />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default FlashDealsSection
