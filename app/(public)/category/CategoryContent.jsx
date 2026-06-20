'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { useDispatch, useSelector } from 'react-redux'
import { fetchCategories } from '@/lib/features/category/categorySlice'
import { fetchProducts } from '@/lib/features/product/productSlice'
import { useSidebar } from '@/context/SidebarContext'
import ProductCard from '@/components/ProductCard'
import Loading from '@/components/Loading'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'

export default function CategoryContent() {
  const dispatch = useDispatch()
  const { sidebarOpen } = useSidebar()
  const searchParams = useSearchParams()
  const categoryFromUrl = searchParams.get('category')
  
  const categories = useSelector(state => state.category.list)
  const categoryStatus = useSelector(state => state.category.status)
  const products = useSelector(state => state.product.list)
  const [selectedCategory, setSelectedCategory] = useState(categoryFromUrl || null)
  const [filteredProducts, setFilteredProducts] = useState([])
  const [loading, setLoading] = useState(true)

  // Update selectedCategory when URL query parameter changes
  useEffect(() => {
    if (categoryFromUrl) {
      setSelectedCategory(categoryFromUrl)
    }
  }, [categoryFromUrl])

  // Fetch categories and products
  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      await Promise.all([
        dispatch(fetchCategories()),
        dispatch(fetchProducts({}))
      ])
      setLoading(false)
    }
    loadData()
  }, [dispatch])

  // Filter products by selected category
  useEffect(() => {
    if (selectedCategory) {
      const filtered = products.filter(product => product.category === selectedCategory)
      setFilteredProducts(filtered)
    } else {
      setFilteredProducts(products)
    }
  }, [selectedCategory, products])

  if (loading) {
    return <Loading />
  }

  // Get unique categories from products
  const productCategories = Array.from(new Set(products.map(p => p.category))).sort()

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* Category Sidebar */}
      <aside className="hidden">
        <div className="bg-white rounded-lg border border-slate-200 p-6 sticky top-20">
          <h2 className="text-lg font-bold text-slate-900 mb-4">Categories</h2>
          
          <button
            onClick={() => setSelectedCategory(null)}
            className={`w-full text-left px-4 py-3 rounded-lg transition-all font-medium mb-2 flex items-center justify-between ${
              selectedCategory === null
                ? 'bg-red-600 text-white shadow-md'
                : 'text-slate-700 hover:bg-slate-100'
            }`}
          >
            All Products
            <ChevronRight size={18} />
          </button>

          <div className="space-y-2">
            {productCategories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`w-full text-left px-4 py-3 rounded-lg transition-all font-medium flex items-center justify-between group ${
                  selectedCategory === cat
                    ? 'bg-orange-600 text-white shadow-md'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <span className="capitalize">{cat}</span>
                <span className={`text-sm font-semibold ${
                  selectedCategory === cat ? 'text-white' : 'text-slate-500 group-hover:text-slate-700'
                }`}>
                  {products.filter(p => p.category === cat).length}
                </span>
              </button>
            ))}
          </div>
        </div>
      </aside>

      {/* Products Grid */}
      <div className="lg:col-span-4">
        {/* Selected Category Title */}
        {selectedCategory && (
          <div className="mb-6">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 capitalize">
              {selectedCategory} Products
            </h2>
            <p className="text-slate-600 mt-1">
              Showing {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''}
            </p>
          </div>
        )}

        {filteredProducts.length > 0 ? (
          <div className="grid gap-4 sm:gap-6 grid-cols-2 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg border border-slate-200 p-12 text-center">
            <svg
              className="w-16 h-16 text-slate-300 mx-auto mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
              />
            </svg>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">No Products Found</h3>
            <p className="text-slate-600 mb-6">
              {selectedCategory ? `No products available in the ${selectedCategory} category` : 'No products available'}
            </p>
            <Link
              href="/"
              className="inline-block bg-orange-600 hover:bg-orange-700 text-white px-6 py-2 rounded-lg font-semibold transition"
            >
              Continue Shopping
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
