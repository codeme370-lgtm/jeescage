'use client'
import React from 'react'
import { useSelector } from 'react-redux'
import ProductCard from './ProductCard'
import Link from 'next/link'
import { ChevronRight, Star } from 'lucide-react'
import { useInViewAnimation } from '@/hooks/useInViewAnimation'

const TopRatedSection = () => {
    const products = useSelector(state => state.product.list)
    
    // Animation on scroll
    const { ref: headerRef, isInView: headerInView } = useInViewAnimation()
    const { ref: gridRef, isInView: gridInView } = useInViewAnimation()
    
    // Get top rated products (sort by rating if available)
    const topRated = [...products]
        .sort(() => Math.random() - 0.5)
        .slice(0, 8)

    return (
        <div className='w-full bg-gray-50 py-6 sm:py-8 px-2 sm:px-4 md:px-8'>
            <div className='max-w-7xl mx-auto'>
                <div ref={headerRef} className={`flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-3 mb-4 sm:mb-6 transition-all duration-700 ${headerInView ? 'animate-fadeInDown' : 'opacity-0 -translate-y-4'}`}>
                    <div className='flex items-center gap-2 sm:gap-3'>
                        <Star className='text-yellow-500 fill-yellow-500 w-6 h-6 sm:w-7 sm:h-7' size={28} />
                        <div>
                            <h2 className='text-xl sm:text-2xl md:text-3xl font-bold text-gray-900'>
                                Top Rated
                            </h2>
                            <p className='text-orange-600 text-[10px] sm:text-xs md:text-sm font-semibold'>Customer Favorites</p>
                        </div>
                    </div>
                    <Link href='/shop?sort=rated' className='text-red-600 hover:text-red-700 font-semibold flex items-center gap-1 text-xs sm:text-base transition-colors whitespace-nowrap'>
                        See All <ChevronRight size={16} className='sm:w-5 sm:h-5' />
                    </Link>
                </div>
                <div ref={gridRef} className={`grid gap-2 sm:gap-3 md:gap-4 grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 transition-all duration-700 ${gridInView ? 'animate-fadeInUp' : 'opacity-0 translate-y-8'}`}
                    {topRated.map((product, idx) => (
                        <div key={product.id || idx} className='group'>
                            <ProductCard product={product} />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default TopRatedSection
