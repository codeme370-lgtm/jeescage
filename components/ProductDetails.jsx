'use client'

import { addToCart } from "@/lib/features/cart/cartSlice";
import { StarIcon, TagIcon, EarthIcon, CreditCardIcon, UserIcon, Check, Loader, Share2, Facebook, Twitter, MessageCircle, Copy } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Counter from "./Counter";
import { useAuth } from "@/context/AuthContext"
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { useDispatch, useSelector } from "react-redux";
import React from "react";
import { assets } from "@/assets/assets";


const ProductDetails = ({ product }) => {

    const productId = product.id;
    const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || 'GHS';

    const cart = useSelector(state => state.cart.cartItems);
    const dispatch = useDispatch();

    const [mainImage, setMainImage] = useState(product?.images?.[0] || assets.product_placeholder || '/placeholder.svg');
    const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
    const [isZoomed, setIsZoomed] = useState(false);
    const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });
    const [isAddingToCart, setIsAddingToCart] = useState(false);
    const [cartConfirmed, setCartConfirmed] = useState(false);
    const [touchStart, setTouchStart] = useState(0);
    const [isMuted, setIsMuted] = useState(true);
    const videoRef = useRef(null);
    const { user, isLoaded } = useAuth()
    const router = useRouter()

    // Build media array combining images and video
    const mediaArray = [
      ...product?.images?.map(img => ({ type: 'image', url: img })) || [],
      ...(product?.videoUrl ? [{ type: 'video', url: product.videoUrl }] : [])
    ];
    const addToCartHandler = async () => {
        if (!isLoaded || !user) {
            toast.error('Please sign in to add items to your cart')
            return
        }
        setIsAddingToCart(true)
        dispatch(addToCart({ productId }))
        
        // Simulate processing
        setTimeout(() => {
            setIsAddingToCart(false)
            setCartConfirmed(true)
            toast.success('Added to cart!')
            setTimeout(() => {
                setCartConfirmed(false)
                router.push('/cart')
            }, 2000)
        }, 600)
    }

    const handleImageHover = (e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        setZoomPosition({
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        });
        setIsZoomed(true);
    }

    const handleMediaSwipe = (direction) => {
        if (mediaArray.length === 0) return;
        if (direction === 'next') {
            setCurrentMediaIndex((prev) => (prev + 1) % mediaArray.length);
        } else {
            setCurrentMediaIndex((prev) => (prev - 1 + mediaArray.length) % mediaArray.length);
        }
    }

    const handleTouchStart = (e) => {
        setTouchStart(e.targetTouches[0].clientX);
    }

    const handleTouchEnd = (e) => {
        const endX = e.changedTouches[0].clientX;
        const startX = touchStart || 0;
        const distance = startX - endX;
        const minSwipeDistance = 50;

        if (Math.abs(distance) < minSwipeDistance) {
            setTouchStart(0);
            return;
        }

        if (distance > 0) {
            // Swiped left (finger moved left) => next media
            handleMediaSwipe('next');
        } else {
            // Swiped right => previous media
            handleMediaSwipe('prev');
        }

        setTouchStart(0);
    }

    const currentMedia = mediaArray[currentMediaIndex];
    const averageRating = product?.rating && product.rating.length > 0 ? product.rating.reduce((acc, item) => acc + item.rating, 0) / product.rating.length : 0;

    useEffect(() => {
        // When switching media by index, if it's a video autoplay muted, pause other media
        const mediaAtIndex = mediaArray[currentMediaIndex];
        if (mediaAtIndex && mediaAtIndex.type === 'video') {
            // ensure video starts muted when navigated to
            setIsMuted(true);
            const v = videoRef.current;
            if (v) {
                try {
                    v.muted = true;
                    v.currentTime = 0;
                    const playPromise = v.play();
                    if (playPromise && typeof playPromise.then === 'function') playPromise.catch(() => {});
                } catch (err) {
                    // ignore autoplay errors
                }
            }
        } else {
            // pause video when not active
            const v = videoRef.current;
            if (v && !v.paused) v.pause();
        }
    }, [currentMediaIndex]);

    const shareProduct = async (platform) => {
        const url = window.location.href;
        const title = product.name;
        const text = `Check out this product: ${title} - ${currency}${product.price}`;

        if (navigator.share && platform === 'native') {
            try {
                await navigator.share({
                    title,
                    text,
                    url
                });
            } catch (err) {
                console.log('Error sharing:', err);
            }
        } else {
            let shareUrl = '';
            switch (platform) {
                case 'facebook':
                    shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
                    break;
                case 'twitter':
                    shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
                    break;
                case 'whatsapp':
                    shareUrl = `https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`;
                    break;
                case 'copy':
                    navigator.clipboard.writeText(url);
                    toast.success('Link copied to clipboard!');
                    return;
                default:
                    return;
            }
            window.open(shareUrl, '_blank');
        }
    };
    
    return (
        <div className="flex max-lg:flex-col gap-4 sm:gap-6 lg:gap-12 w-full">
            <div className="flex max-sm:flex-col-reverse gap-1 sm:gap-3 flex-1 min-w-0 lg:max-w-2xl">
                {/* Thumbnail Gallery */}
                <div className="flex sm:flex-col gap-1 sm:gap-3 max-sm:order-2 flex-shrink-0">
                    {mediaArray && mediaArray.map((media, index) => (
                        <div 
                            key={index} 
                            onClick={() => { if (media.type === 'video') setIsMuted(true); setCurrentMediaIndex(index); }} 
                            className={`bg-slate-100 flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-lg group cursor-pointer border-2 transition-all duration-200 ${currentMediaIndex === index ? 'border-green-500 shadow-lg' : 'border-transparent hover:border-slate-300'}`}
                        >
                            {media.type === 'image' ? (
                                <Image 
                                    src={media.url || assets.product_placeholder} 
                                    className="group-hover:scale-110 group-active:scale-95 transition duration-300 w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20" 
                                    alt={product?.name ? `${product.name} thumbnail ${index + 1}` : 'Product thumbnail'} 
                                    width={80} 
                                    height={80} 
                                />
                            ) : (
                                <div className="flex items-center justify-center gap-1 text-xs font-semibold text-orange-600 bg-orange-50 w-full h-full rounded-md">
                                    <span>▶</span>
                                    <span>VIDEO</span>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
                
                {/* Main Media Display with Swap*/}
                <div 
                    className="flex justify-center items-center w-full min-h-[300px] sm:min-h-[400px] md:min-h-[450px] 2xl:min-h-[500px] bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg overflow-hidden relative group cursor-zoom-in flex-1 min-w-0"
                    onMouseEnter={currentMedia?.type === 'image' ? handleImageHover : undefined}
                    onMouseLeave={() => setIsZoomed(false)}
                    onTouchStart={handleTouchStart}
                    onTouchEnd={handleTouchEnd}
                >
                    <div className="relative w-full h-full flex items-center justify-center p-2 sm:p-4">
                        {currentMedia?.type === 'image' ? (
                            <Image 
                                src={currentMedia.url} 
                                alt={product?.name ? `${product.name} main image` : 'Product main image'} 
                                width={500} 
                                height={500} 
                                priority
                                className={`transition-transform duration-300 w-full h-full object-contain max-w-full ${isZoomed ? 'scale-150' : 'scale-100'}`}
                                style={{ transformOrigin: `${zoomPosition.x}px ${zoomPosition.y}px` }}
                            />
                        ) : currentMedia?.type === 'video' ? (
                            <div className="relative w-full h-full">
                                <video
                                    ref={videoRef}
                                    src={currentMedia.url}
                                    className="w-full h-full object-contain bg-black"
                                    playsInline
                                    autoPlay
                                    loop
                                    muted={isMuted}
                                    controls={false}
                                />

                                {/* Unmute / Mute Button */}
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setIsMuted(prev => !prev);
                                        const v = videoRef.current;
                                        if (v) v.muted = !isMuted;
                                    }}
                                    className="absolute bottom-3 right-3 bg-black/60 text-white px-3 py-1 rounded-full text-sm backdrop-blur"
                                    aria-label={isMuted ? 'Unmute video' : 'Mute video'}
                                >
                                    {isMuted ? '🔇 Unmute' : '🔊 Mute'}
                                </button>
                            </div>
                        ) : null}
                    </div>

                    {/* Navigation Arrows */}
                    {mediaArray.length > 1 && (
                        <>
                            <button
                                onClick={() => handleMediaSwipe('prev')}
                                className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 sm:p-3 rounded-full transition-all z-10"
                                aria-label="Previous media"
                            >
                                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                            </button>
                            <button
                                onClick={() => handleMediaSwipe('next')}
                                className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 sm:p-3 rounded-full transition-all z-10"
                                aria-label="Next media"
                            >
                                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </button>
                            
                            {/* Media Counter */}
                            <div className="absolute bottom-2 sm:bottom-4 right-2 sm:right-4 bg-black/70 text-white px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium">
                                {currentMediaIndex + 1} / {mediaArray.length}
                            </div>
                        </>
                    )}

                    {isZoomed && currentMedia?.type === 'image' && (
                        <div className="absolute top-2 right-2 bg-slate-800 text-white px-3 py-1 rounded-full text-xs font-medium animate-pulse">
                            🔍 Zoom
                        </div>
                    )}
                </div>
            </div>
            
            {/* Product Details */}
            <div className="w-full flex-1 min-w-0">
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent line-clamp-3">{product.name}</h1>
                
                {/* Rating Section */}
                <div className='flex items-center mt-2 sm:mt-3 gap-2 flex-wrap'>
                    <div className="flex">
                        {Array(5).fill('').map((_, index) => (
                            <StarIcon key={index} size={16} className='text-transparent' fill={averageRating >= index + 1 ? "#00C950" : "#D1D5DB"} />
                        ))}
                    </div>
                    <p className="text-sm font-medium text-slate-600">{product?.rating?.length || 0} Customer Reviews</p>
                </div>
                
                {/* Price Section */}
                <div className="flex items-start my-3 sm:my-4 md:my-6 gap-2 sm:gap-4 flex-wrap text-lg sm:text-xl md:text-2xl font-bold text-slate-800">
                    <p className="bg-gradient-to-r from-green-600 to-green-500 bg-clip-text text-transparent text-xl sm:text-2xl md:text-3xl">{currency}{product.price}</p>
                    <p className="text-sm sm:text-base md:text-lg text-slate-400 line-through">{currency}{product.mrp}</p>
                    <span className="text-xs sm:text-sm font-semibold bg-green-100 text-green-700 px-2 sm:px-3 py-1 rounded-full whitespace-nowrap">Save {((product.mrp - product.price) / product.mrp * 100).toFixed(0)}%</span>
                </div>
                
                <hr className="border-gray-300 my-6" />
                
                {/* Quantity and Add to Cart */}
                <div className="flex flex-wrap items-end gap-2 sm:gap-3 md:gap-5 mb-4 sm:mb-6">
                    {
                        cart[productId] && (
                            <div className="flex flex-col gap-2 sm:gap-3">
                                <p className="text-sm sm:text-base md:text-lg text-slate-800 font-semibold">Quantity</p>
                                <Counter productId={productId} />
                            </div>
                        )
                    }
                    <button 
                        onClick={() => !cart[productId] ? addToCartHandler() : router.push('/cart')} 
                        disabled={isAddingToCart}
                        className={`flex items-center justify-center gap-2 w-full sm:w-auto px-6 sm:px-8 md:px-10 py-2 sm:py-3 text-xs sm:text-sm md:text-base font-semibold rounded-lg transition-all duration-300 ${
                            cartConfirmed 
                                ? 'bg-green-500 text-white' 
                                : !cart[productId]
                                    ? 'bg-gradient-to-r from-slate-800 to-slate-900 text-white hover:shadow-lg hover:from-slate-900 hover:to-black active:scale-95'
                                    : 'bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:shadow-lg active:scale-95'
                        } ${isAddingToCart ? 'opacity-80' : ''}`}
                    >
                        {isAddingToCart ? (
                            <>
                                <Loader size={18} className="animate-spin" />
                                Adding...
                            </>
                        ) : cartConfirmed ? (
                            <>
                                <Check size={18} />
                                Added to Cart!
                            </>
                        ) : (
                            !cart[productId] ? 'Add to Cart' : 'View Cart'
                        )}
                    </button>
                </div>
                
                <hr className="border-gray-300 my-6" />
                
                {/* Trust Badges */}
                <div className="bg-gradient-to-r from-slate-50 to-slate-100 rounded-lg p-3 sm:p-4 space-y-2 sm:space-y-3 border border-slate-200">
                    <div className="flex gap-2 sm:gap-3 items-center text-slate-700 text-xs sm:text-sm md:text-base font-medium"> 
                        <div className="bg-red-100 p-1.5 sm:p-2 rounded-full flex-shrink-0">
                            <EarthIcon className="text-red-600" size={16} />
                        </div>
                        Free delivery worldwide
                    </div>
                    <div className="flex gap-2 sm:gap-3 items-center text-slate-700 text-xs sm:text-sm md:text-base font-medium"> 
                        <div className="bg-blue-100 p-1.5 sm:p-2 rounded-full flex-shrink-0">
                            <CreditCardIcon className="text-blue-600" size={16} />
                        </div>
                        100% Secured Payment
                    </div>
                    <div className="flex gap-2 sm:gap-3 items-center text-slate-700 text-xs sm:text-sm md:text-base font-medium"> 
                        <div className="bg-purple-100 p-1.5 sm:p-2 rounded-full flex-shrink-0">
                            <UserIcon className="text-purple-600" size={16} />
                        </div>
                        Trusted by thousands
                    </div>
                </div>
                
                {/* Share Options */}
                <div className="mt-4 sm:mt-6">
                    <h3 className="text-sm sm:text-base md:text-lg font-semibold text-slate-800 mb-2 sm:mb-3 flex items-center gap-2">
                        <Share2 size={16} className="sm:size-[18px] md:size-[20px]" />
                        Share
                    </h3>
                    <div className="flex flex-wrap gap-1.5 sm:gap-2 md:gap-3">
                        {navigator.share && (
                            <button
                                onClick={() => shareProduct('native')}
                                className="flex items-center gap-1 sm:gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 text-xs md:text-sm rounded-lg transition-colors whitespace-nowrap"
                            >
                                <Share2 size={12} className="sm:size-[14px] md:size-[16px]" />
                                <span className="hidden sm:inline">Share</span>
                            </button>
                        )}
                        <button
                            onClick={() => shareProduct('facebook')}
                            className="flex items-center gap-1 sm:gap-2 bg-blue-600 hover:bg-blue-700 text-white px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 text-xs md:text-sm rounded-lg transition-colors whitespace-nowrap"
                        >
                            <Facebook size={12} className="sm:size-[14px] md:size-[16px]" />
                            <span className="hidden sm:inline">FB</span>
                        </button>
                        <button
                            onClick={() => shareProduct('twitter')}
                            className="flex items-center gap-1 sm:gap-2 bg-sky-500 hover:bg-sky-600 text-white px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 text-xs md:text-sm rounded-lg transition-colors whitespace-nowrap"
                        >
                            <Twitter size={12} className="sm:size-[14px] md:size-[16px]" />
                            <span className="hidden sm:inline">X</span>
                        </button>
                        <button
                            onClick={() => shareProduct('whatsapp')}
                            className="flex items-center gap-1 sm:gap-2 bg-green-500 hover:bg-green-600 text-white px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 text-xs md:text-sm rounded-lg transition-colors whitespace-nowrap"
                        >
                            <MessageCircle size={12} className="sm:size-[14px] md:size-[16px]" />
                            <span className="hidden sm:inline">WA</span>
                        </button>
                        <button
                            onClick={() => shareProduct('copy')}
                            className="flex items-center gap-1 sm:gap-2 bg-gray-600 hover:bg-gray-700 text-white px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 text-xs md:text-sm rounded-lg transition-colors whitespace-nowrap"
                        >
                            <Copy size={12} className="sm:size-[14px] md:size-[16px]" />
                            <span className="hidden sm:inline">Link</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ProductDetails