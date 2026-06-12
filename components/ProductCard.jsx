'use client'
import { StarIcon, ShoppingCart, Check, Heart } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import React, { useState } from 'react'
import { assets } from '@/assets/assets'
import { useDispatch, useSelector } from 'react-redux'
import { addToCart } from '@/lib/features/cart/cartSlice'
import { addToWishlist, removeFromWishlist } from '@/lib/features/wishlist/wishlistSlice'
import { useAuth } from "@/context/AuthContext"
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { useInViewAnimation } from '@/hooks/useInViewAnimation'

const ProductCard = ({ product, hideAddToCart = false }) => {

    const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || 'GHS'
    const [isAdding, setIsAdding] = useState(false)
    const [addedSuccess, setAddedSuccess] = useState(false)
    const dispatch = useDispatch()
    const { user } = useAuth()
    const router = useRouter()
    const cart = useSelector(state => state.cart.cartItems)
    const wishlistItems = useSelector(state => state.wishlist.wishlistItems)
    const isInWishlist = wishlistItems[product.id]
    
    // Animation on scroll
    const { ref, isInView } = useInViewAnimation()

    // calculate the average rating of the product
    const rating = product.rating && product.rating.length > 0 
        ? Math.round(product.rating.reduce((acc, curr) => acc + curr.rating, 0) / product.rating.length)
        : 0;

    const isOutOfStock = product.quantity <= 0

    const handleAddToCart = (e) => {
        e.preventDefault()
        e.stopPropagation()

        if (!user) {
            toast.error('Please sign in to add items to cart')
            return
        }

        setIsAdding(true)
        dispatch(addToCart({ productId: product.id, selectedColor: product.availableColors?.[0] || null }))

        setTimeout(() => {
            setIsAdding(false)
            setAddedSuccess(true)
            toast.success('Added to cart!')
        }, 600)
    }

    const handleWishlist = (e) => {
        e.preventDefault()
        e.stopPropagation()

        if (!user) {
            toast.error('Please sign in to add items to wishlist')
            return
        }

        if (isInWishlist) {
            dispatch(removeFromWishlist({ productId: product.id }))
            toast.success('Removed from wishlist')
        } else {
            dispatch(addToWishlist({ productId: product.id }))
            toast.success('Added to wishlist')
        }
    }

    const handleSellerClick = (e, username) => {
        e.preventDefault()
        e.stopPropagation()
        router.push(`/seller/${username}`)
    }

    return (
        <Link href={`/product/${product.id}`} className='group max-xl:mx-auto block'>
            <div ref={ref} className={`relative transition-all duration-700 ${isInView ? 'animate-fadeInUp' : 'opacity-0 translate-y-8'}`}>
                {/* Product Image */}
                <div className='bg-gradient-to-br from-slate-100 to-slate-50 h-32 sm:h-44 md:h-56 lg:h-64 w-full rounded-lg flex items-center justify-center overflow-hidden shadow-md group-hover:shadow-xl transition-shadow duration-300 relative'>
                    <Image 
                        width={500} 
                        height={500}
                        className='w-full h-full object-cover group-hover:scale-115 transition duration-300' 
                        src={product.images?.[0] || '/placeholder.jpg'} 
                        alt={product?.name ? `${product.name} image` : 'Product image'} 
                    />
                    {isOutOfStock && (
                        <div className='absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center'>
                            <span className='text-white font-bold text-sm sm:text-lg'>Out of Stock</span>
                        </div>
                    )}
                </div>

                {/* Quick Cart Icon - Top Right */}
                {!hideAddToCart && (
                    <button
                        onClick={handleAddToCart}
                        disabled={isAdding || addedSuccess || isOutOfStock}
                        title={isOutOfStock ? "Out of stock" : "Add to cart"}
                        className={`absolute top-1 right-1 sm:top-2 sm:right-2 p-1.5 sm:p-2 rounded-full shadow-lg transition-all duration-300 transform hover:scale-110 ${
                            addedSuccess
                                ? 'bg-green-500 text-white scale-110'
                                : isOutOfStock
                                ? 'bg-gray-400 text-white cursor-not-allowed'
                                : 'bg-white text-slate-800 hover:bg-slate-100 border-2 border-slate-200 hover:border-slate-300'
                        } ${isAdding ? 'scale-95' : ''}`}
                    >
                        {isAdding ? (
                            <div className='w-4 h-4 sm:w-5 sm:h-5 border-2 border-slate-800 border-t-transparent rounded-full animate-spin'></div>
                        ) : addedSuccess ? (
                            <Check size={16} className='text-white sm:w-5 sm:h-5' />
                        ) : (
                            <ShoppingCart size={16} className='sm:w-5 sm:h-5' />
                        )}
                    </button>
                )}

                {/* Wishlist Heart Icon - Top Left */}
                <button
                    onClick={handleWishlist}
                    title={isInWishlist ? "Remove from wishlist" : "Add to wishlist"}
                    className={`absolute top-1 left-1 sm:top-2 sm:left-2 p-1.5 sm:p-2 rounded-full shadow-lg transition-all duration-300 transform hover:scale-110 ${
                        isInWishlist
                            ? 'bg-red-600 text-white'
                            : 'bg-white text-slate-800 hover:bg-slate-100 border-2 border-slate-200 hover:border-slate-300'
                    }`}
                >
                    <Heart size={14} className={`sm:w-5 sm:h-5 ${isInWishlist ? 'fill-white' : ''}`} />
                </button>
            </div>

            {/* Product Info */}
            <div className='w-full pt-1.5 sm:pt-2.5'>
                <div className='flex flex-col gap-0.5 sm:gap-1.5'>
                    <p className='font-semibold text-[10px] sm:text-xs md:text-sm line-clamp-2 text-slate-800 leading-tight'>{product.name}</p>
                    
                    {/* Seller Info */}
                    {product.store && (
                        <button
                            onClick={(e) => handleSellerClick(e, product.store.username)}
                            className='text-[9px] sm:text-xs text-blue-600 hover:underline truncate text-left hover:text-blue-700 transition'
                        >
                            {product.store.name}
                            {product.store.isVerified && ' ✓'}
                        </button>
                    )}
                    
                    <div className='flex items-center gap-0.5 sm:gap-1'>
                        <div className='flex'>
                            {Array(5).fill('').map((_, index) => (
                                <StarIcon key={index} size={9} className='sm:w-3 sm:h-3 text-transparent' fill={rating >= index + 1 ? "#fbbf24" : "#D1D5DB"} />
                            ))}
                        </div>
                        <span className='text-[8px] sm:text-xs text-slate-500 max-sm:hidden'>({product.rating?.length || 0})</span>
                    </div>
                    <div className='flex items-baseline gap-0.5 sm:gap-1.5'>
                        <p className='font-bold text-slate-900 text-[10px] sm:text-xs md:text-sm'>{currency}{product.price}</p>
                        <p className='text-[8px] sm:text-xs text-slate-400 line-through'>{currency}{product.mrp}</p>
                    </div>
                </div>
            </div>
        </Link>
    )
}

export default ProductCard