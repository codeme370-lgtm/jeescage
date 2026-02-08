'use client'
import { assets } from '@/assets/assets'
import { ArrowRightIcon, ChevronRightIcon } from 'lucide-react'
import Image from 'next/image'
import React from 'react'
import CategoriesMarquee from './CategoriesMarquee'
import './Hero.css'


const Hero = () => {

    const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || 'GHS'

    return (
        <div className='mx-6'>
            <div className='flex max-xl:flex-col gap-8 max-w-7xl mx-auto my-10'>
                <div className='relative flex-1 flex flex-col bg-gray-300 rounded-3xl xl:min-h-44 overflow-hidden group justify-center items-center p-4 animate-fadeIn hover:shadow-2xl transition-shadow duration-500'>
                    <Image className='w-full h-full object-cover animate-floatScale' src={assets.hero_model_img1} alt="Hero model" />
                </div>
                <div className='flex flex-col md:flex-row xl:flex-col gap-5 w-full xl:max-w-sm text-sm text-slate-600'>
                    <div className='flex-1 flex items-center justify-center w-full bg-gray-200 shadow-sm rounded-3xl overflow-hidden group hover:shadow-lg transition-shadow duration-500 animate-slideInLeft'>
                        <Image className='w-full h-full object-cover animate-continuousLeft' src={assets.hero1} alt="Featured product 1" />
                    </div>
                    <div className='flex-1 flex items-center justify-center w-full bg-gray-300 shadow-sm rounded-3xl overflow-hidden group hover:shadow-lg transition-shadow duration-500 animate-slideInRight'>
                        <Image className='w-full h-full object-cover animate-continuousRight' src={assets.hero2} alt="Featured product 2" />
                    </div>
                </div>
            </div>
            <CategoriesMarquee />
        </div>

    )
}

export default Hero