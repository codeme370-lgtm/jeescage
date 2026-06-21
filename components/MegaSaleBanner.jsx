'use client'
import React from 'react'
import Link from 'next/link'

const MegaSaleBanner = () => {
    return (
        <div className='w-full'>
            {/* Two-column banner layout - keep only the main banner on medium/tablet screens */}
            <div className='grid grid-cols-1 md:grid-cols-1 lg:grid-cols-3 gap-2 sm:gap-3 md:gap-4 w-full'>
                {/* Mega Sale Banner - Left (full width on mobile/medium, 2/3 on desktop) */}
                <div className='relative col-span-1 md:col-span-1 lg:col-span-2 bg-gradient-to-r from-red-600 via-red-500 to-orange-600 rounded-lg sm:rounded-xl overflow-hidden shadow-lg h-36 sm:h-44 md:h-56 flex items-center'>
                    {/* Background pattern */}
                    <div className='absolute inset-0 opacity-20'>
                        <div className='absolute top-0 right-0 w-64 sm:w-80 h-64 sm:h-80 bg-yellow-300 rounded-full blur-3xl'></div>
                        <div className='absolute bottom-0 left-0 w-48 sm:w-60 h-48 sm:h-60 bg-orange-400 rounded-full blur-2xl'></div>
                    </div>

                    <div className='relative z-10 px-3 sm:px-6 md:px-8 py-3 sm:py-4 flex flex-col justify-center h-full'>
                        <h2 className='text-lg sm:text-2xl md:text-4xl font-bold text-white mb-0.5 sm:mb-1'>Mega Sale</h2>
                        <div className='flex items-center gap-1 sm:gap-2 mb-2 sm:mb-3'>
                            <span className='text-white font-semibold text-xs sm:text-base'>UP TO</span>
                            <span className='text-2xl sm:text-4xl md:text-5xl font-bold text-yellow-300'>70%</span>
                            <span className='text-white font-semibold text-xs sm:text-base'>OFF</span>
                        </div>
                        <p className='text-[10px] sm:text-xs md:text-sm text-white mb-2 sm:mb-4 opacity-95'>
                            • Free Shipping | Top Brands
                        </p>
                        <Link href='/shop?section=mega-sale' className='inline-block bg-white hover:bg-gray-100 text-red-600 font-bold px-3 sm:px-6 py-1 sm:py-2 rounded-lg transition-all duration-200 text-xs sm:text-sm md:text-base w-fit shadow-md hover:shadow-lg'>
                            Shop Now
                        </Link>
                    </div>
                </div>

                {/* Daily Deals Banner - Right (shown only on large screens) */}
                <div className='hidden lg:flex relative col-span-1 bg-gradient-to-br from-orange-50 to-red-50 rounded-lg sm:rounded-xl overflow-hidden shadow-lg h-36 sm:h-44 md:h-56 flex-col items-start justify-center px-3 sm:px-6 md:px-8 py-3 sm:py-4 border-2 border-orange-100'>
                    {/* Background decoration */}
                    <div className='absolute top-0 right-0 w-32 h-32 bg-yellow-200 rounded-full blur-2xl opacity-40'></div>

                    <div className='relative z-10'>
                        <h3 className='text-lg sm:text-2xl md:text-3xl font-bold text-gray-900 mb-1 sm:mb-2 leading-tight'>Daily<br/><span className='text-red-600'>Deals</span></h3>
                        
                        <div className='flex items-center gap-1 sm:gap-2 mb-2 sm:mb-4'>
                            <span className='inline-block bg-red-600 text-white text-[10px] sm:text-xs md:text-sm font-bold px-2 sm:px-3 py-0.5 sm:py-1 rounded-md'>40% OFF</span>
                            <span className='text-xs sm:text-sm md:text-base text-gray-700 font-semibold whitespace-nowrap'>Limited Time</span>
                        </div>
                        
                        <Link href='/shop?section=daily-deals' className='inline-block bg-orange-500 hover:bg-orange-600 text-white font-bold px-2.5 sm:px-5 py-1 sm:py-2 rounded-lg transition-all duration-200 text-[10px] sm:text-xs md:text-sm shadow-md hover:shadow-lg'>
                            Buy Now
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default MegaSaleBanner
