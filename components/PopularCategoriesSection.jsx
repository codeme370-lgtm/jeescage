 'use client'
import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { useSelector, useDispatch } from 'react-redux'
import Image from 'next/image'
import { ChevronRight } from 'lucide-react'
import { fetchProducts } from '@/lib/features/product/productSlice'
import { fetchCategories } from '@/lib/features/category/categorySlice'

const PopularCategoriesSection = () => {
    const products = useSelector(state => state.product.list)
    const dbCategories = useSelector(state => state.category.list)
    const dispatch = useDispatch()
    const [scrollPosition, setScrollPosition] = useState(0)

    useEffect(() => {
        // If categories or products are missing, fetch them
        if ((!dbCategories || dbCategories.length === 0)) {
            dispatch(fetchCategories())
        }
        if ((!products || products.length === 0)) {
            dispatch(fetchProducts({}))
        }
    }, [dbCategories.length, products.length, dispatch])
    
    // Build category data from products, but ordered by database categories
    const categoriesData = {}
    products.forEach(product => {
        if (!categoriesData[product.category]) {
            categoriesData[product.category] = {
                name: product.category,
                count: 0,
                products: []
            }
        }
        categoriesData[product.category].count++
        if (categoriesData[product.category].products.length < 1) {
            categoriesData[product.category].products.push(product)
        }
    })

    // Order categories by database order
    const categories = dbCategories
        .filter(cat => categoriesData[cat.name])
        .map(cat => categoriesData[cat.name])

    // Enhanced color palette for categories with gradients
    const colors = [
        { bg: 'bg-blue-600', gradient: 'from-blue-500 to-blue-700', text: 'text-white' },
        { bg: 'bg-orange-500', gradient: 'from-orange-400 to-orange-600', text: 'text-white' },
        { bg: 'bg-pink-500', gradient: 'from-pink-400 to-pink-600', text: 'text-white' },
        { bg: 'bg-purple-600', gradient: 'from-purple-500 to-purple-700', text: 'text-white' },
        { bg: 'bg-yellow-400', gradient: 'from-yellow-300 to-yellow-500', text: 'text-gray-900' },
        { bg: 'bg-green-600', gradient: 'from-green-500 to-green-700', text: 'text-white' },
    ]

    // Continuous scroll animation
    useEffect(() => {
        if (categories.length === 0) return

        let animationFrameId
        let currentScroll = 0
        const scrollContainer = document.getElementById('categories-scroll-container')
        
        if (!scrollContainer) return

        const totalWidth = scrollContainer.scrollWidth
        const containerWidth = scrollContainer.clientWidth
        const scrollableWidth = totalWidth - containerWidth

        const animate = () => {
            currentScroll += 0.3 // Smooth continuous scroll
            
            if (currentScroll > scrollableWidth) {
                currentScroll = 0 // Loop back to start
            }
            
            scrollContainer.scrollLeft = currentScroll
            setScrollPosition(currentScroll)
            animationFrameId = requestAnimationFrame(animate)
        }

        animationFrameId = requestAnimationFrame(animate)

        return () => cancelAnimationFrame(animationFrameId)
    }, [categories])

    return (
        <div className='w-full bg-gray-50 py-6 sm:py-8 px-2 sm:px-4 md:px-8'>
            <div className='max-w-7xl mx-auto'>
                <div className='flex items-center justify-between gap-2 sm:gap-3 mb-4 sm:mb-6'>
                    <h2 className='text-lg sm:text-2xl md:text-3xl font-bold text-gray-900'>Popular Categories</h2>
                    <Link href='/shop' className='text-orange-600 hover:text-orange-700 font-semibold text-xs sm:text-base flex items-center gap-0.5 sm:gap-1 transition-colors flex-shrink-0'>
                        <ChevronRight size={14} className='sm:w-5 sm:h-5' />
                    </Link>
                </div>
                
                <div 
                    id="categories-scroll-container"
                    className='overflow-x-hidden no-scrollbar'
                    style={{ scrollBehavior: 'auto' }}
                >
                    <div className='flex gap-2 sm:gap-3 md:gap-4'>
                        {/* Original categories */}
                        {categories.map((category, idx) => {
                            const color = colors[idx % colors.length]
                            const productImage = category.products?.[0]?.images?.[0]
                            
                            return (
                                <Link key={`${category.name}-${idx}`} href={`/category/${encodeURIComponent(category.name)}`}>
                                    <div className='relative bg-white border border-slate-200 rounded-lg overflow-hidden cursor-pointer hover:shadow-lg transform hover:scale-105 transition-all duration-200 h-28 sm:h-40 md:h-48 min-w-[180px] md:min-w-[220px] flex flex-col items-center justify-center flex-shrink-0'>
                                        {/* Background product image with low opacity */}
                                        {productImage && (
                                            <Image
                                                src={productImage}
                                                alt={category.name}
                                                fill
                                                className='object-cover opacity-20 absolute inset-0'
                                            />
                                        )}

                                        <div className='absolute inset-0 bg-slate-50/60'></div>

                                        {/* Content overlay */}
                                        <div className='relative z-10 text-center px-2 sm:px-4'>
                                            <h3 className='font-bold text-sm sm:text-base md:text-lg line-clamp-2 mb-1 text-slate-900'>
                                                {category.name}
                                            </h3>
                                            <p className='text-sm sm:text-base text-slate-700 font-semibold'>
                                                {category.count} products
                                            </p>
                                        </div>
                                    </div>
                                </Link>
                            )
                        })}

                        {/* Duplicate categories for seamless loop */}
                        {categories.map((category, idx) => {
                            const color = colors[idx % colors.length]
                            const productImage = category.products?.[0]?.images?.[0]
                            
                            return (
                                <Link key={`${category.name}-duplicate-${idx}`} href={`/category/${encodeURIComponent(category.name)}`}>
                                    <div className='relative bg-white border border-slate-200 rounded-lg overflow-hidden cursor-pointer hover:shadow-lg transform hover:scale-105 transition-all duration-200 h-28 sm:h-40 md:h-48 min-w-[180px] md:min-w-[220px] flex flex-col items-center justify-center flex-shrink-0'>
                                        {/* Background product image with low opacity */}
                                        {productImage && (
                                            <Image
                                                src={productImage}
                                                alt={category.name}
                                                fill
                                                className='object-cover opacity-20 absolute inset-0'
                                            />
                                        )}

                                        <div className='absolute inset-0 bg-slate-50/60'></div>

                                        {/* Content overlay */}
                                        <div className='relative z-10 text-center px-2 sm:px-4'>
                                            <h3 className='font-bold text-sm sm:text-base md:text-lg line-clamp-2 mb-1 text-slate-900'>
                                                {category.name}
                                            </h3>
                                            <p className='text-sm sm:text-base text-slate-700 font-semibold'>
                                                {category.count} products
                                            </p>
                                        </div>
                                    </div>
                                </Link>
                            )
                        })}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default PopularCategoriesSection
