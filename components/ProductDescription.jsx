'use client'
import { ArrowRight, StarIcon } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useState } from "react"
import { assets } from "@/assets/assets"

const ProductDescription = ({ product }) => {

    const tabs = ['Overview','Specifications','Reviews','Q&A','Videos']
    const [selectedTab, setSelectedTab] = useState('Overview')

    const specs = product?.specs && product.specs.length > 0 ? product.specs : [
        ['Category', product?.category || '-'],
        ['In Stock', product?.inStock ? 'Yes' : 'No'],
        ['Quantity', product?.quantity || 0],
        ['SKU', product?.id || '-']
    ]

    return (
        <div className="my-9 sm:my-12 md:my-18 text-xs sm:text-sm md:text-base text-slate-600">

            {/* Tabs */}
            <div className="flex border-b border-slate-200 mb-4 sm:mb-6 max-w-3xl overflow-x-auto">
                {tabs.map((tab, index) => (
                    <button key={tab} onClick={() => setSelectedTab(tab)} className={`${tab === selectedTab ? 'border-b-[2px] border-slate-900 font-semibold' : 'text-slate-400'} px-3 py-2 mr-2 whitespace-nowrap`}>{tab}{tab==='Reviews' && product?.rating?.length ? ` (${product.rating.length})` : ''}</button>
                ))}
            </div>

            {/* Overview */}
            {selectedTab === 'Overview' && (
                <div className="max-w-3xl leading-relaxed text-slate-700">
                    <p>{product?.description}</p>
                </div>
            )}

            {/* Specifications */}
            {selectedTab === 'Specifications' && (
                <div className="max-w-3xl mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-slate-700">
                    {specs.map((s, i) => (
                        <div key={i} className="flex gap-2"><div className="font-medium text-slate-800 w-28">{s[0]}</div><div className="flex-1">{s[1]}</div></div>
                    ))}
                </div>
            )}

            {/* Reviews */}
            {selectedTab === 'Reviews' && (
                <div className="flex flex-col gap-3 mt-4 sm:mt-6">
                    {product?.rating && product.rating.length > 0 ? product.rating.map((item,index) => (
                        <div key={index} className="flex gap-3 sm:gap-5">
                            <Image src={item.user.image} alt={item.user?.name ? `${item.user.name} avatar` : 'User avatar'} className="w-8 h-8 sm:w-10 sm:h-10 rounded-full flex-shrink-0" width={100} height={100} />
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center" >
                                    {Array(5).fill('').map((_, idx) => (
                                        <StarIcon key={idx} size={14} className='sm:size-[18px] text-transparent mt-0.5' fill={item.rating >= idx + 1 ? "#00C950" : "#D1D5DB"} />
                                    ))}
                                </div>
                                <p className="text-xs sm:text-sm md:text-base my-2 sm:my-4 break-words">{item.review}</p>
                                <p className="font-medium text-slate-800 text-xs sm:text-sm">{item.user.name}</p>
                                <p className="mt-2 sm:mt-3 font-light text-xs sm:text-sm text-slate-500">{new Date(item.createdAt).toDateString()}</p>
                            </div>
                        </div>
                    )) : <p className="text-slate-400">No reviews yet</p>}
                </div>
            )}

            {/* Q&A */}
            {selectedTab === 'Q&A' && (
                <div className="max-w-3xl mt-4 text-slate-700">
                    <p className="text-slate-500">No questions yet. Be the first to ask about this product.</p>
                </div>
            )}

            {/* Videos */}
            {selectedTab === 'Videos' && (
                <div className="max-w-3xl mt-4">
                    {product?.videoUrl ? (
                        <video src={product.videoUrl} controls autoPlay loop muted playsInline className="w-full rounded-lg" />
                    ) : (
                        <p className="text-slate-500">No product videos</p>
                    )}
                </div>
            )}

            {/* Store Page */}
            <div className="flex gap-3 mt-10">
                <Image src={product.store?.logo || '/favicon.ico' || assets.product_placeholder || '/placeholder.svg'} alt={product.store?.name ? `${product.store.name} logo` : 'Store logo'} className="size-11 rounded-full ring ring-slate-400 object-cover" width={100} height={100} />
                <div>
                    <p className="font-medium text-slate-600">Product by {product.store?.name}</p>
                    <Link href={`/shop/${product.store?.username || ''}`} className="flex items-center gap-1.5 text-green-500"> view store <ArrowRight size={14} /></Link>
                </div>
            </div>
        </div>
    )
}

export default ProductDescription