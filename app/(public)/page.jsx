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
                    <Hero />
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

            {/* Why Shop With Us - White background with borders */}
            <WhyShopWithUsSection />

            {/* Video Carousel - Featured Videos */}
            <VideoCarousel />
        </div>
    );
}

