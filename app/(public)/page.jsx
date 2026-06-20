'use client'

import Hero from "@/components/Hero";
import QuickLinks from "@/components/QuickLinks";
import FlashDealsSection from "@/components/FlashDealsSection";
import PopularCategoriesSection from "@/components/PopularCategoriesSection";
import BestSellersSection from "@/components/BestSellersSection";
import TopRatedSection from "@/components/TopRatedSection";
import WhyShopWithUsSection from "@/components/WhyShopWithUsSection";
import VideoCarousel from "@/components/VideoCarousel";

export default function Home() {
    return (
        <div className='min-h-screen'>
            {/* Mega Sale Banner - Full width white background */}
            <div className='bg-white px-2 sm:px-4 md:px-8 py-4 sm:py-6 md:py-8'>
                <div className='max-w-7xl mx-auto'>
                    {/* Desktop/Tablet: keep existing rotating hero */}
                    <div className='hidden md:block'>
                        <Hero />
                    </div>

                    {/* Mobile: welcome + question + search */}
                    <div className='md:hidden mx-2'>
                        <div className='rounded-2xl bg-gradient-to-br from-white via-amber-50 to-orange-50 border border-amber-100 shadow-sm p-4'>
                            <p className='text-xs font-semibold text-amber-700'>Welcome to JeesCage</p>
                            <h1 className='mt-1 text-xl font-extrabold tracking-tight text-gray-900'>What do you expect from us today?</h1>

                            <form
                                className='mt-3 flex items-center gap-2'
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    const fd = new FormData(e.currentTarget);
                                    const q = (fd.get('q') || '').toString().trim();
                                    window.location.href = `/search?q=${encodeURIComponent(q)}`;
                                }}
                            >
                                <input
                                    name='q'
                                    type='text'
                                    placeholder='Search products...'
                                    className='flex-1 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-800 placeholder:text-gray-400 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100'
                                />
                                <button
                                    type='submit'
                                    className='shrink-0 rounded-xl bg-orange-500 hover:bg-orange-600 text-white px-3 py-2 text-sm font-bold shadow-sm'
                                >
                                    Search
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Links - White background */}
            <QuickLinks />

            {/* Flash Deals Section - White background */}
            <FlashDealsSection />

            {/* Popular Categories - Gray background */}
            <PopularCategoriesSection />

            {/* Best Sellers - White background */}
            <BestSellersSection />

            {/* Top Rated - Gray background */}
            <TopRatedSection />

            {/* Video Carousel - Featured Videos */}
            <VideoCarousel />

            {/* Why Shop With Us - White background with borders */}
            <WhyShopWithUsSection />
        </div>
    );
}

