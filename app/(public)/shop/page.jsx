'use client'
import { Suspense, useMemo, useState } from "react"
import ProductCard from "@/components/ProductCard"
import { MoveLeftIcon } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import { useSelector } from "react-redux"

 function ShopContent() {

    // get query params ?search=abc
    const searchParams = useSearchParams()
    const search = searchParams.get('search')
    const router = useRouter()

    const products = useSelector(state => state.product.list)

    // UI state for filters/sort
    const [categoryFilter, setCategoryFilter] = useState('all')
    const [typeFilter, setTypeFilter] = useState('all')
    const [sizeFilter, setSizeFilter] = useState('all')
    const [priceSort, setPriceSort] = useState('none') // 'asc' | 'desc'

    // derive unique categories, types, sizes from products
    const { categories, types, sizes } = useMemo(() => {
        const c = new Set()
        const t = new Set()
        const s = new Set()
        products.forEach(p => {
            if (p.category) c.add(p.category)
            if (p.type) t.add(p.type)
            if (p.sizes && Array.isArray(p.sizes)) p.sizes.forEach(sz => s.add(sz))
        })
        return { categories: Array.from(c), types: Array.from(t), sizes: Array.from(s) }
    }, [products])

    // apply search, filters and sorting
    const filteredProducts = useMemo(() => {
        let list = products.slice()
        if (search) {
            list = list.filter(product => product.name.toLowerCase().includes(search.toLowerCase()))
        }
        if (categoryFilter !== 'all') {
            list = list.filter(p => p.category === categoryFilter)
        }
        if (typeFilter !== 'all' && typeFilter !== '') {
            list = list.filter(p => p.type === typeFilter)
        }
        if (sizeFilter !== 'all' && sizeFilter !== '') {
            list = list.filter(p => Array.isArray(p.sizes) && p.sizes.includes(sizeFilter))
        }

        if (priceSort === 'asc') list.sort((a,b) => a.price - b.price)
        if (priceSort === 'desc') list.sort((a,b) => b.price - a.price)

        return list
    }, [products, search, categoryFilter, typeFilter, sizeFilter, priceSort])

    return (
        <div className="min-h-[70vh] mx-6">
            <div className=" max-w-7xl mx-auto">
                <h1 onClick={() => router.push('/shop')} className="text-2xl text-slate-500 my-6 flex items-center gap-2 cursor-pointer"> {search && <MoveLeftIcon size={20} />}  All <span className="text-slate-700 font-medium">Products</span></h1>

                {/* Filter & Sort Controls */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 justify-between mb-6">
                    <div className="flex items-center gap-3 flex-wrap">
                        <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="px-3 py-2 rounded-md border border-slate-200 bg-white text-sm">
                            <option value="all">All Categories</option>
                            {categories.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>

                        <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="px-3 py-2 rounded-md border border-slate-200 bg-white text-sm">
                            <option value="all">All Types</option>
                            {types.length === 0 ? <option value="">(no types)</option> : types.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>

                        <select value={sizeFilter} onChange={(e) => setSizeFilter(e.target.value)} className="px-3 py-2 rounded-md border border-slate-200 bg-white text-sm">
                            <option value="all">All Sizes</option>
                            {sizes.length === 0 ? <option value="">(no sizes)</option> : sizes.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>

                    <div className="flex items-center gap-3">
                        <label className="text-sm text-slate-600">Sort by price:</label>
                        <select value={priceSort} onChange={(e) => setPriceSort(e.target.value)} className="px-3 py-2 rounded-md border border-slate-200 bg-white text-sm">
                            <option value="none">None</option>
                            <option value="asc">Low → High</option>
                            <option value="desc">High → Low</option>
                        </select>
                    </div>
                </div>

                <div className={`grid gap-2 sm:gap-4 lg:gap-6 grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 mx-auto mb-32`}>
                    {filteredProducts.map((product) => <ProductCard key={product.id} product={product} />)}
                </div>
            </div>
        </div>
    )
}


export default function Shop() {
  return (
    <Suspense fallback={<div>Loading shop...</div>}>
      <ShopContent />
    </Suspense>
  );
}