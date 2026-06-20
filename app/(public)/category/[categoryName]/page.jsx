'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { useDispatch, useSelector } from 'react-redux'
import { fetchCategories } from '@/lib/features/category/categorySlice'
import { fetchProducts } from '@/lib/features/product/productSlice'
import { useSidebar } from '@/context/SidebarContext'
import ProductCard from '@/components/ProductCard'
import Loading from '@/components/Loading'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'

export default function CategoryPage() {
  const params = useParams()
  const categoryName = decodeURIComponent(params.categoryName)
  const dispatch = useDispatch()
  const { sidebarOpen } = useSidebar()
  
  const categories = useSelector(state => state.category.list)
  const categoryStatus = useSelector(state => state.category.status)
  const products = useSelector(state => state.product.list)
  const [filteredProducts, setFilteredProducts] = useState([])
  const [loading, setLoading] = useState(true)

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
    const filtered = products.filter(product => product.category === categoryName)
    setFilteredProducts(filtered)
  }, [categoryName, products])

  if (loading) {
    return <Loading />
  }

  // Get unique categories from products
  const productCategories = Array.from(new Set(products.map(p => p.category))).sort()

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-2 mb-2">
            <Link href="/category" className="text-red-600 hover:text-red-700 font-medium text-sm">
              Categories
            </Link>
            <ChevronRight size={16} className="text-slate-400" />
            <span className="text-slate-600 text-sm capitalize">{categoryName}</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 capitalize">
            <span className="text-red-600">{categoryName}</span> Products
          </h1>
          <p className="text-slate-600 mt-2">{filteredProducts.length} products found</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Category Sidebar */}
          <aside className="hidden lg:block">
            <div className="bg-white rounded-lg border border-slate-200 p-6 sticky top-20">
              <h2 className="text-lg font-bold text-slate-900 mb-4">Categories</h2>
              
              <Link href="/category" className="w-full">
                <button
                  className="w-full text-left px-4 py-3 rounded-lg transition-all font-medium mb-2 flex items-center justify-between text-slate-700 hover:bg-slate-100"
                >
                  All Categories
                  <ChevronRight size={18} />
                </button>
              </Link>

              <div className="space-y-2">
                {productCategories.map((cat) => (
                  <Link key={cat} href={`/category/${encodeURIComponent(cat)}`}>
                    <button
                      className={`w-full text-left px-4 py-3 rounded-lg transition-all font-medium flex items-center justify-between group ${
                        categoryName === cat
                          ? 'bg-red-600 text-white shadow-md'
                          : 'text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <span className="capitalize">{cat}</span>
                      <span className={`text-sm font-semibold ${
                        categoryName === cat ? 'text-white' : 'text-slate-500 group-hover:text-slate-700'
                      }`}>
                        {products.filter(p => p.category === cat).length}
                      </span>
                    </button>
                  </Link>
                ))}
              </div>
            </div>
          </aside>

          {/* Products Grid */}
          <div className="lg:col-span-3">
            {filteredProducts.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 bg-white rounded-lg border border-slate-200">
                <p className="text-slate-600 text-lg font-medium mb-4">No products found in this category</p>
                <Link href="/shop" className="text-red-600 hover:text-red-700 font-semibold">
                  Browse all products →
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
