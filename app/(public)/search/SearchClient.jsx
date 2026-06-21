"use client"

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import axios from 'axios'
import { ChevronDown, X, RotateCcw } from 'lucide-react'
import ProductCard from '@/components/ProductCard'
import Loading from '@/components/Loading'
import toast from 'react-hot-toast'

export default function SearchClient() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [results, setResults] = useState(null)
  const [loading, setLoading] = useState(false)
  const [showFilters, setShowFilters] = useState(true)

  // Filter states
  const [query, setQuery] = useState(searchParams?.get('q') || '')
  const [minPrice, setMinPrice] = useState(parseInt(searchParams?.get('minPrice')) || 0)
  const [maxPrice, setMaxPrice] = useState(parseInt(searchParams?.get('maxPrice')) || 10000)
  const [minRating, setMinRating] = useState(parseFloat(searchParams?.get('minRating')) || 0)
  const [category, setCategory] = useState(searchParams?.get('category') || '')
  const [seller, setSeller] = useState(searchParams?.get('seller') || '')
  const [sortBy, setSortBy] = useState(searchParams?.get('sortBy') || 'newest')
  const [page, setPage] = useState(parseInt(searchParams?.get('page')) || 1)

  const performSearch = async (pageNum = 1) => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        q: query,
        minPrice,
        maxPrice,
        minRating,
        ...(category && { category }),
        ...(seller && { seller }),
        sortBy,
        page: pageNum,
        limit: 20
      })

      const { data } = await axios.get(`/api/products/search?${params}`)
      setResults(data)
      setPage(pageNum)

      // update url without full navigation
      router.push(`?${params.toString()}`, { shallow: true })
    } catch (err) {
      toast.error('Failed to search products')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    performSearch(1)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleFilterChange = () => performSearch(1)
  const resetFilters = () => {
    setQuery('')
    setMinPrice(0)
    setMaxPrice(10000)
    setMinRating(0)
    setCategory('')
    setSeller('')
    setSortBy('newest')
    setPage(1)
    performSearch(1)
  }

  const handleSearch = (e) => {
    e.preventDefault()
    performSearch(1)
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <form onSubmit={handleSearch} className="flex gap-2">
            <input
              type="text"
              placeholder="Search products, stores, categories..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium">Search</button>
            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className={`px-4 py-2 border rounded-lg transition ${showFilters ? 'bg-blue-50 border-blue-600 text-blue-600' : 'border-slate-300'}`}>
              Filters
            </button>
          </form>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="flex gap-6">
          {showFilters && (
            <aside className="w-64 flex-shrink-0">
              <div className="bg-white rounded-lg p-6 border border-slate-200">
                <button onClick={resetFilters} className="w-full flex items-center justify-center gap-2 mb-6 text-sm text-blue-600 hover:bg-blue-50 p-2 rounded transition">
                  <RotateCcw size={16} /> Reset Filters
                </button>

                <div className="mb-6">
                  <h3 className="font-semibold text-slate-800 mb-3">Price Range</h3>
                  <div className="space-y-2">
                    <input type="number" placeholder="Min" value={minPrice} onChange={(e) => setMinPrice(parseInt(e.target.value) || 0)} className="w-full px-3 py-2 border border-slate-300 rounded text-sm" />
                    <input type="number" placeholder="Max" value={maxPrice} onChange={(e) => setMaxPrice(parseInt(e.target.value) || 10000)} className="w-full px-3 py-2 border border-slate-300 rounded text-sm" />
                    <button onClick={handleFilterChange} className="w-full py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition">Apply</button>
                  </div>
                </div>

                <div className="mb-6">
                  <h3 className="font-semibold text-slate-800 mb-3">Min Rating</h3>
                  <select value={minRating} onChange={(e) => { setMinRating(parseFloat(e.target.value)); handleFilterChange(); }} className="w-full px-3 py-2 border border-slate-300 rounded text-sm">
                    <option value="0">All Ratings</option>
                    <option value="4">⭐ 4.0+</option>
                    <option value="3">⭐ 3.0+</option>
                    <option value="2">⭐ 2.0+</option>
                    <option value="1">⭐ 1.0+</option>
                  </select>
                </div>

                {results?.categories && results.categories.length > 0 && (
                  <div className="mb-6">
                    <h3 className="font-semibold text-slate-800 mb-3">Category</h3>
                    <select value={category} onChange={(e) => { setCategory(e.target.value); handleFilterChange(); }} className="w-full px-3 py-2 border border-slate-300 rounded text-sm">
                      <option value="">All Categories</option>
                      {results.categories.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                  </div>
                )}

                {results?.featuredSellers && results.featuredSellers.length > 0 && (
                  <div className="mb-6">
                    <h3 className="font-semibold text-slate-800 mb-3">Featured Sellers</h3>
                    <div className="space-y-2">
                      {results.featuredSellers.slice(0, 5).map((s) => (
                        <label key={s.id} className="flex items-center gap-2 cursor-pointer">
                          <input type="radio" name="seller" value={s.username} checked={seller === s.username} onChange={(e) => { setSeller(e.target.value); handleFilterChange(); }} className="w-4 h-4" />
                          <span className="text-sm text-slate-700 flex-1">{s.name}</span>
                          <span className="text-xs text-yellow-600">⭐ {s.averageRating}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <h3 className="font-semibold text-slate-800 mb-3">Sort By</h3>
                  <select value={sortBy} onChange={(e) => { setSortBy(e.target.value); handleFilterChange(); }} className="w-full px-3 py-2 border border-slate-300 rounded text-sm">
                    <option value="newest">Newest</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                    <option value="rating">Highest Rated</option>
                    <option value="popular">Most Popular</option>
                  </select>
                </div>
              </div>
            </aside>
          )}

          <main className="flex-1">
            {loading ? (
              <Loading />
            ) : results && results.products ? (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {results.products.map((p) => (
                    <ProductCard key={p.id} product={p} />
                  ))}
                </div>

                <div className="mt-6 flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600">Showing page {page} of {results.totalPages || 1}</p>
                  </div>
                  <div className="flex gap-2">
                    <button disabled={page <= 1} onClick={() => performSearch(page - 1)} className="px-3 py-1 bg-white border rounded">Previous</button>
                    <button disabled={page >= (results.totalPages || 1)} onClick={() => performSearch(page + 1)} className="px-3 py-1 bg-white border rounded">Next</button>
                  </div>
                </div>
              </>
            ) : (
              <div className="bg-white rounded-lg p-8 border border-slate-200 text-center">
                <p className="text-slate-700">No products found. Try adjusting your filters.</p>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  )
}

