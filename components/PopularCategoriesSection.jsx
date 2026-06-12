 'use client'
import React, { useEffect } from 'react'
import Link from 'next/link'
import { useSelector, useDispatch } from 'react-redux'
import { ChevronRight } from 'lucide-react'
import { fetchProducts } from '@/lib/features/product/productSlice'
import { fetchCategories } from '@/lib/features/category/categorySlice'
import { useInViewAnimation } from '@/hooks/useInViewAnimation'

const PopularCategoriesSection = () => {
    const products = useSelector(state => state.product.list)
    const dbCategories = useSelector(state => state.category.list)
    const dispatch = useDispatch()
    
    // Animation on scroll
    const { ref: headerRef, isInView: headerInView } = useInViewAnimation()
    const { ref: scrollRef, isInView: scrollInView } = useInViewAnimation()

    useEffect(() => {
        if ((!dbCategories || dbCategories.length === 0)) {
            dispatch(fetchCategories())
        }
        if ((!products || products.length === 0)) {
            dispatch(fetchProducts({}))
        }
    }, [dbCategories.length, products.length, dispatch])
    
    // Build category data from products
    const categoriesData = {}
    products.forEach(product => {
        if (!categoriesData[product.category]) {
            categoriesData[product.category] = {
                name: product.category,
                count: 0,
            }
        }
        categoriesData[product.category].count++
    })

    // Order categories by database order
    const categories = dbCategories
        .filter(cat => categoriesData[cat.name])
        .map(cat => categoriesData[cat.name])

    // Color palette for categories
    const colors = [
        { gradient: 'from-blue-500 to-blue-700', icon: '🎧' },
        { gradient: 'from-orange-400 to-orange-600', icon: '🔊' },
        { gradient: 'from-pink-400 to-pink-600', icon: '⌚' },
        { gradient: 'from-purple-500 to-purple-700', icon: '🎵' },
        { gradient: 'from-yellow-300 to-yellow-500', icon: '🖱️' },
        { gradient: 'from-green-500 to-green-700', icon: '✨' },
    ]

    return (
        <div className='w-full bg-white py-8 sm:py-12'>
            <div className='max-w-7xl mx-auto px-4'>
                <div ref={headerRef} className={`flex items-center justify-between gap-2 sm:gap-3 mb-6 sm:mb-8 transition-all duration-700 ${headerInView ? 'animate-fadeInDown' : 'opacity-0 -translate-y-4'}`}>
                    <h2 className='text-2xl sm:text-3xl font-bold text-gray-900'>Popular Categories</h2>
                    <Link href='/shop' className='text-blue-600 hover:text-blue-700 font-semibold text-sm sm:text-base flex items-center gap-1 transition-colors'>
                        View All <ChevronRight size={18} />
                    </Link>
                </div>
                
                <div className='relative overflow-hidden'>
                    {/* Left gradient overlay */}
                    <div className='absolute left-0 top-0 h-full w-12 z-20 pointer-events-none bg-gradient-to-r from-white to-transparent' />
                    
                    {/* Scrolling container */}
                    <div ref={scrollRef} className={`overflow-hidden transition-all duration-700 ${scrollInView ? 'animate-fadeInUp' : 'opacity-0 translate-y-8'}`}>
                        <div 
                            className='flex gap-4 sm:gap-6'
                            style={{
                                animation: 'scrollHorizontal 35s linear infinite',
                            }}
                        >
                            {/* Duplicate twice for seamless looping */}
                            {[...categories, ...categories].map((category, idx) => {
                                const colorSet = colors[idx % colors.length]
                                
                                return (
                                    <Link 
                                        key={`${category.name}-${idx}`} 
                                        href={`/category/${encodeURIComponent(category.name)}`}
                                    >
                                        <div className={`flex-shrink-0 min-w-[110px] sm:min-w-[130px] bg-gradient-to-br ${colorSet.gradient} rounded-2xl p-2 sm:p-3 cursor-pointer transition-all duration-300 hover:shadow-xl hover:scale-115 transform hover:-translate-y-2`}>
                                            <div className='h-12 sm:h-16 flex flex-col items-center justify-center gap-0.5'>
                                                {/* Category name */}
                                                <h3 className='font-bold text-xs sm:text-sm text-white text-center line-clamp-1'>
                                                    {category.name}
                                                </h3>
                                                
                                                {/* Count */}
                                                <p className='text-xs text-white/80 font-medium'>
                                                    {category.count}
                                                </p>
                                            </div>
                                        </div>
                                    </Link>
                                )
                            })}
                        </div>
                    </div>
                    
                    {/* Right gradient overlay */}
                    <div className='absolute right-0 top-0 h-full w-12 z-20 pointer-events-none bg-gradient-to-l from-white to-transparent' />
                </div>
            </div>
        </div>
    )
}

export default PopularCategoriesSection
