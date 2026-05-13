'use client'
import { Heart, Trash2Icon, ShoppingCart } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { removeFromWishlist } from "@/lib/features/wishlist/wishlistSlice";
import { addToCart } from "@/lib/features/cart/cartSlice";
import { fetchProducts } from "@/lib/features/product/productSlice";
import { useAuth } from "@/context/AuthContext";
import toast from "react-hot-toast";
import ProductCard from "@/components/ProductCard";

export default function Wishlist() {
    const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || 'GHS';
    
    const { wishlistItems } = useSelector(state => state.wishlist);
    const products = useSelector(state => state.product.list);
    const { user } = useAuth();

    const dispatch = useDispatch();

    const [wishlistArray, setWishlistArray] = useState([]);
    const [loadingItems, setLoadingItems] = useState(new Set());
    const [suggestedProducts, setSuggestedProducts] = useState([]);

    const createWishlistArray = () => {
        const wishlistArray = [];
        for (const [key] of Object.entries(wishlistItems)) {
            const product = products.find(product => product.id === key);
            if (product) {
                wishlistArray.push(product);
            }
        }
        setWishlistArray(wishlistArray);
    }

    const handleRemoveFromWishlist = (productId) => {
        dispatch(removeFromWishlist({ productId }))
        toast.success('Removed from wishlist')
    }

    const handleAddToCart = (productId) => {
        setLoadingItems(prev => new Set(prev).add(productId))
        dispatch(addToCart({ productId }))
        setTimeout(() => {
            setLoadingItems(prev => {
                const newSet = new Set(prev)
                newSet.delete(productId)
                return newSet
            })
            toast.success('Added to cart')
        }, 600)
    }

    useEffect(() => {
        if (products.length > 0) {
            createWishlistArray();
            setSuggestedProducts(products.slice(0, 20));
        }
    }, [wishlistItems, products]);

    useEffect(() => {
        dispatch(fetchProducts({}));
    }, [dispatch]);

    return (
        <div className="min-h-screen bg-white">
            <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-2">
                        <Heart className="text-red-600 fill-red-600" size={32} />
                        <h1 className="text-3xl md:text-4xl font-bold text-gray-900">My Wishlist</h1>
                    </div>
                    <p className="text-gray-600 text-sm md:text-base">{wishlistArray.length} item{wishlistArray.length !== 1 ? 's' : ''} saved</p>
                </div>

                {/* Wishlist Grid or Empty State */}
                {wishlistArray.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 md:gap-6">
                        {wishlistArray.map((product, index) => (
                            <div key={index} className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-all duration-300 group">
                                {/* Product Image */}
                                <Link href={`/product/${product.id}`}>
                                    <div className="relative bg-gray-100 h-48 flex items-center justify-center overflow-hidden">
                                        <Image
                                            src={product.images?.[0] || '/placeholder.jpg'}
                                            alt={product?.name || 'Product'}
                                            width={200}
                                            height={200}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                        />
                                        {/* Wishlist Badge */}
                                        <button
                                            onClick={(e) => {
                                                e.preventDefault()
                                                handleRemoveFromWishlist(product.id)
                                            }}
                                            className="absolute top-3 right-3 bg-red-600 hover:bg-red-700 text-white p-2 rounded-full shadow-lg transition-all"
                                            title="Remove from wishlist"
                                        >
                                            <Heart size={18} className="fill-white" />
                                        </button>
                                    </div>
                                </Link>

                                {/* Product Info */}
                                <div className="p-4">
                                    <Link href={`/product/${product.id}`}>
                                        <h3 className="text-sm md:text-base font-semibold text-gray-900 line-clamp-2 hover:text-red-600 transition-colors">
                                            {product.name}
                                        </h3>
                                    </Link>

                                    {/* Store Info */}
                                    {product.store && (
                                        <p className="text-xs text-gray-600 mt-1">
                                            {product.store.name} {product.store.isVerified && '✓'}
                                        </p>
                                    )}

                                    {/* Price */}
                                    <div className="flex items-center gap-2 mt-3 mb-4">
                                        <p className="text-lg font-bold text-gray-900">{currency}{product.price}</p>
                                        {product.mrp && (
                                            <p className="text-sm text-gray-500 line-through">{currency}{product.mrp}</p>
                                        )}
                                    </div>

                                    {/* Discount */}
                                    {product.mrp && product.price && (
                                        <div className="text-xs font-semibold text-white bg-red-600 px-2 py-1 rounded w-fit mb-4">
                                            {Math.round(((product.mrp - product.price) / product.mrp) * 100)}% OFF
                                        </div>
                                    )}

                                    {/* Action Buttons */}
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleAddToCart(product.id)}
                                            disabled={loadingItems.has(product.id)}
                                            className="flex-1 flex items-center justify-center gap-2 bg-orange-600 hover:bg-orange-700 text-white font-semibold py-2 px-3 rounded-lg transition-all disabled:opacity-50"
                                        >
                                            <ShoppingCart size={16} />
                                            <span className="text-sm">Add</span>
                                        </button>
                                        <button
                                            onClick={() => handleRemoveFromWishlist(product.id)}
                                            className="flex items-center justify-center bg-gray-100 hover:bg-red-100 text-gray-700 hover:text-red-600 p-2 rounded-lg transition-all"
                                            title="Remove from wishlist"
                                        >
                                            <Trash2Icon size={18} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="min-h-[40vh] flex flex-col items-center justify-center mb-12">
                        <Heart size={64} className="text-gray-300 mb-4" />
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Your Wishlist is Empty</h2>
                        <p className="text-gray-600 text-center mb-6">
                            Add items to your wishlist to save them for later
                        </p>
                        <Link 
                            href="/shop"
                            className="bg-orange-600 hover:bg-orange-700 text-white font-semibold px-6 py-3 rounded-lg transition-all"
                        >
                            Continue Shopping
                        </Link>
                    </div>
                )}

                {/* Suggested Products - always show */}
                {suggestedProducts.length > 0 && (
                    <div className="py-12">
                        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-8">
                            <span className="text-red-600">Suggested</span> Products
                        </h2>
                        <div className="grid grid-cols-4 sm:grid-cols-4 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-6">
                            {suggestedProducts.map((product) => (
                                <ProductCard key={product.id} product={product} />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
