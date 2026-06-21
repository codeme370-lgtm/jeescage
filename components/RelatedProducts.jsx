'use client'
import React from 'react'
import { useSelector } from 'react-redux'
import ProductCard from './ProductCard'

const RelatedProducts = ({ product }) => {
    const products = useSelector(state => state.product.list)

    // Get all related products from the same category, excluding the current product
    const relatedProducts = products
        .filter(p => p.category === product.category && p.id !== product.id)

    if (relatedProducts.length === 0) {
        return null // Don't show section if no related products
    }

    return (
        <div className='mt-16 mb-12'>
            <div className='flex items-center gap-3 mb-8'>
                <div className='h-8 w-1 bg-gradient-to-b from-green-600 to-green-400 rounded-full'></div>
                <h2 className='text-3xl font-bold bg-gradient-to-r from-green-600 to-green-500 bg-clip-text text-transparent'>
                    Related Products
                </h2>
            </div>
            <div className='grid grid-cols-3 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6'>
                {relatedProducts.map((relatedProduct, index) => (
                    <div key={index} className='transform transition-all duration-300 hover:scale-105'>
                        <ProductCard product={relatedProduct} />
                    </div>
                ))}
            </div>
        </div>
    )
}

export default RelatedProducts
