'use client'
import React from 'react'
import Title from './Title'
import ProductCard from './ProductCard'
import { useSelector } from 'react-redux'


const LatestProducts = () => {
    const productsPerCategory = 4
    const products = useSelector(state => state.product.list)

    // Group products by category and sort by latest
    const groupedByCategory = products.reduce((acc, product) => {
        if (!acc[product.category]) {
            acc[product.category] = []
        }
        acc[product.category].push(product)
        return acc
    }, {})

    // Sort products within each category by createdAt (newest first) and limit to productsPerCategory
    const categorizedProducts = Object.keys(groupedByCategory).map(category => ({
        category,
        products: groupedByCategory[category]
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, productsPerCategory)
    }))

    return (
        <div className='pl-4 pr-6 my-8 max-w-6xl mx-auto'>
            <Title title='Latest Products' description='Browse our latest products by category' href='/shop' />
            <div className='mt-8 space-y-8'>
                {categorizedProducts.map((categoryGroup, categoryIndex) => (
                    <div key={categoryIndex} className='group'>
                        <div className='flex items-center gap-3 mb-4'>
                            <div className='h-8 w-1 bg-gradient-to-b from-green-600 to-green-400 rounded-full'></div>
                            <h3 className='text-3xl font-bold bg-gradient-to-r from-green-600 to-green-500 bg-clip-text text-transparent capitalize'>{categoryGroup.category}</h3>
                        </div>
                        <div className={`grid gap-3 sm:gap-4 lg:gap-6 grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4`}>
                            {categoryGroup.products.map((product, productIndex) => (
                                <div key={productIndex} className='transform transition-all duration-300 hover:scale-105'>
                                    <ProductCard product={product} />
                                </div>
                            ))}
                        </div>
                        {categoryIndex !== categorizedProducts.length - 1 && (
                            <div className='mt-8 h-px bg-gradient-to-r from-transparent via-slate-300 to-transparent'></div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    )
}

export default LatestProducts