'use client'
import React from 'react'
import { useSelector } from 'react-redux'
import ProductCard from './ProductCard'
import Link from 'next/link'
import { ChevronRight, Flame } from 'lucide-react'
import { useSidebar } from '@/context/SidebarContext'
import { useInViewAnimation } from '@/hooks/useInViewAnimation'

const BestSellersSection = () => {
    const { sidebarOpen } = useSidebar()
    const products = useSelector(state => state.product.list)
    
    // Animation on scroll
    const { ref: headerRef, isInView: headerInView } = useInViewAnimation()
    const { ref: gridRef, isInView: gridInView } = useInViewAnimation()
    
    // Sort by some criteria (you can adjust based on your data)
    const bestSellers = [...products]
        .sort(() => Math.random() - 0.5) // Random for now, can be replaced with actual sales data
        .slice(0, 20)

    return (
        <div className='w-full bg-white py-6 sm:py-8 px-2 sm:px-4 md:px-8'>
            <div className='max-w-7xl mx-auto'>
                <div ref={headerRef} className={`flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-3 mb-4 sm:mb-6 transition-all duration-700 ${headerInView ? 'animate-fadeInDown' : 'opacity-0 -translate-y-4'}`}>
                    <div className='flex items-center gap-2 sm:gap-3'>
                        <Flame className='text-red-600 fill-red-600 w-6 h-6 sm:w-7 sm:h-7' size={28} />
                        <div>
                            <h2 className='text-xl sm:text-2xl md:text-3xl font-bold text-gray-900'>Best Sellers</h2>
                            <p className='text-orange-600 text-[10px] sm:text-xs md:text-sm font-semibold'>Trending</p>
                        </div>
                    </div>
                    <Link href='/shop?sort=bestsellers' className='text-red-600 hover:text-red-700 font-semibold flex items-center gap-1 text-xs sm:text-base transition-colors whitespace-nowrap'>
                        See All <ChevronRight size={16} className='sm:w-4 sm:h-4' />
                    </Link>
                </div>

                <div ref={gridRef} className={`grid gap-2 sm:gap-3 md:gap-4 transition-all duration-700 ${gridInView ? 'animate-fadeInUp' : 'opacity-0 translate-y-8'} ${sidebarOpen ? 'grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4' : 'grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5'}`}>
                    {bestSellers.map((product, idx) => (
                        <div key={product.id || idx} className='group relative'>
                            {/* Special badges */}
                            {idx === 0 && (
                                <div className='absolute top-1 right-1 sm:top-2 sm:right-2 bg-red-600 text-white px-1.5 sm:px-3 py-0.5 sm:py-1 rounded text-[9px] sm:text-xs font-bold z-20 shadow-md'>
                                    Hot
                                </div>
                            )}

                            {idx === 1 && (
                                <div className='absolute top-1 right-1 sm:top-2 sm:right-2 bg-blue-600 text-white px-1.5 sm:px-3 py-0.5 sm:py-1 rounded text-[9px] sm:text-xs font-bold z-20 shadow-md'>
                                    Free Shipping
                                </div>
                            )}

                            <div className='relative'>
                                <ProductCard product={product} />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default BestSellersSection
