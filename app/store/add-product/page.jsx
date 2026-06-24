'use client'

import { assets } from "@/assets/assets"
import Image from "next/image"
import { useState } from "react"
import { toast } from "react-hot-toast"
import { useAuth } from "@/context/AuthContext"
import axios from "axios"
import React from "react"
import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { addProduct } from '@/lib/features/product/productSlice'



export default function StoreAddProduct() {

    const [categories, setCategories] = useState(['Electronics', 'Clothing', 'Home & Kitchen', 'Beauty & Health', 'Toys & Games', 'Sports & Outdoors', 'Books & Media', 'Food & Drink', 'Hobbies & Crafts', 'Others'])
    const [newCategoryName, setNewCategoryName] = useState('')
    const [aiSuggestion, setAiSuggestion] = useState(null)

    const [images, setImages] = useState({ 1: null, 2: null, 3: null, 4: null })
    const [video, setVideo] = useState(null)
    const colorOptions = ['Black', 'White', 'Red', 'Blue', 'Green', 'Yellow', 'Pink', 'Purple', 'Gray', 'Brown']
    const [productInfo, setProductInfo] = useState({
        name: "",
        description: "",
        mrp: 0,
        price: 0,
        category: "",
        quantity: 0,
        availableColors: [],
    })
    const [loading, setLoading] = useState(false)
     const [aiUsed, setAiUsed] = useState(false)


    const {getToken} = useAuth()
    const dispatch = useDispatch()

    useEffect(() => {
        const fetchCats = async () => {
            try {
                const { data } = await axios.get('/api/store/category')
                if (data?.categories) setCategories(prev => Array.from(new Set([...data.categories.map(c=>c.name), ...prev])))
            } catch (e) { /* ignore */ }
        }
        fetchCats()
    }, [])


    const onChangeHandler = (e) => {
        setProductInfo({ ...productInfo, [e.target.name]: e.target.value })
    }

    const toggleColor = (color) => {
        setProductInfo((prev) => ({
            ...prev,
            availableColors: prev.availableColors.includes(color)
                ? prev.availableColors.filter((item) => item !== color)
                : [...prev.availableColors, color],
        }))
    }

    const handleImageUpload=async (key, file) => {
        setImages(prev=>({...prev, [key]:file}))
        if(key== "1" && file && !aiUsed){
            //convert the uploaded  image into a converted image
            const reader=new FileReader()
            reader.readAsDataURL(file)
            reader.onloadend=async () => {
                const base64String = reader.result.split(",")[1]
                const mimeType = file.type
                const token = await getToken()

                //make the api call
                try {
                    await toast.promise(
                        axios.post('/api/store/ai',{base64Image: base64String, mimeType},{
                            headers:{Authorization: `Bearer ${token}`}
                        }),
                        {
                            loading:"Analyzing image with AI....",
                            success: (res)=>{
                                const data = res.data
                                if(data.name && data.description){
                                    setProductInfo(prev =>({
                                        ...prev,
                                        name:data.name,
                                        description:data.description
                                    }))
                                    setAiUsed(true)
                                    return "AI filled product info"
                                }
                                return "AI could not analyze the image"
                            },
                            error:(err)=> err?.response?.data?.error || err.message
                        }
                    )
                } catch (error) {
                    console.error(error)
                }
                
            }
        }
        
    }

    const onSubmitHandler = async (e) => {
        e.preventDefault()
        //  add a product
        try {
            //if no images uploaded
            if (!images[1] && !images[2] && !images[3] && !images[4]) {
                return toast.error("Please upload at least one product image")
                
            }
            setLoading(true)

            //get the token
            const token = await getToken()

            //upload images first and get URLs
            const imageUrls = []
            for(const key in images){
                if(images[key]){
                    const uploadFormData = new FormData()
                    uploadFormData.append("file", images[key])
                    
                    const uploadResponse = await axios.post('/api/store/upload', uploadFormData, {
                        headers: {
                            Authorization: `Bearer ${token}`,
                            'Content-Type': 'multipart/form-data'
                        }
                    })
                    imageUrls.push(uploadResponse.data.imageUrl)
                }
            }

            //upload video if provided
            let videoUrl = null
            if (video) {
                const videoFormData = new FormData()
                videoFormData.append("file", video)
                
                const videoResponse = await axios.post('/api/store/upload', videoFormData, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data'
                    }
                })
                videoUrl = videoResponse.data.mediaUrl
            }

            //create a form data that will be sent to the api
            const formData = new FormData()
            formData.append("name", productInfo.name)
            formData.append("description", productInfo.description)
            formData.append("mrp", productInfo.mrp)
            formData.append("price", productInfo.price)
            formData.append("category", productInfo.category)
            formData.append("quantity", productInfo.quantity)
            productInfo.availableColors.forEach((color) => {
                formData.append("availableColors", color)
            })

            //adding image URLs to form data instead of files
            imageUrls.forEach((url) => {
                formData.append("imageUrls", url)
            })
            if (videoUrl) {
                formData.append("videoUrl", videoUrl)
            }

            //send the form data to the api
            const response = await axios.post("/api/store/product", formData, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })
            toast.success("Product added successfully")
            // Add the new product to the Redux store
            if (response.data.product) {
                dispatch(addProduct(response.data.product))
            }
            //reset the form
            setProductInfo({
                name: "",
                description: "",
                mrp: 0,
                price: 0,
                category: "",
                quantity: 0,
                availableColors: [],
            })
            //reset images
            setImages({ 1: null, 2: null, 3: null, 4: null })
            //reset video
            setVideo(null)
        } catch (error) {
            toast.error(error.response?.data?.message || "Something went wrong while adding the product")
        }finally {
            setLoading(false)
        }
        
    }


    return (
        <div className="min-h-screen bg-slate-100/90 py-8 sm:py-10">
            <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
                <div className="mb-8 text-center">
                    <span className="inline-block rounded-full bg-slate-800 px-4 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-white shadow-sm">Seller Dashboard</span>
                    <h1 className="mt-4 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">Add New Products</h1>
                    <p className="mx-auto mt-3 max-w-2xl text-sm text-slate-600 sm:text-base">Use the polished form below to publish a product with clear media, pricing, and product details.</p>
                </div>

                <form onSubmit={e => toast.promise(onSubmitHandler(e), { loading: "Adding Product..." })} className="space-y-6">
                    <div className="rounded-[2rem] border border-slate-200 bg-white/95 p-4 shadow-2xl shadow-slate-200/70 backdrop-blur-xl sm:p-6 lg:p-8">
                        <div className="space-y-6">
                            <section className="rounded-3xl border border-slate-200 bg-slate-50/70 p-4 shadow-sm transition sm:p-6">
                                <div className="mb-4">
                                    <h2 className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-600">Product Media</h2>
                                    <p className="mt-1 text-sm text-slate-500">Upload clear images for your product. The first image becomes the main thumbnail.</p>
                                </div>
                                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                                    {Object.keys(images).map((key) => (
                                        <label key={key} htmlFor={`images${key}`} className="group cursor-pointer overflow-hidden rounded-2xl border border-dashed border-slate-300 bg-white p-2 text-center shadow-sm transition hover:border-slate-400 hover:shadow-md">
                                            <div className="flex h-28 items-center justify-center overflow-hidden rounded-xl bg-slate-100 sm:h-32">
                                                <Image width={300} height={300} className="h-full w-full object-cover" src={images[key] ? URL.createObjectURL(images[key]) : assets.upload_area} alt={images[key] ? `Product image ${key} preview` : 'Upload placeholder'} />
                                            </div>
                                            <div className="mt-2 text-sm font-medium text-slate-600">Image {key}</div>
                                            <input type="file" accept="image/*" id={`images${key}`} onChange={e => handleImageUpload(key, e.target.files[0])} hidden />
                                        </label>
                                    ))}
                                </div>
                            </section>

                            <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
                                <div className="mb-4">
                                    <h2 className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-600">Pricing & Inventory</h2>
                                    <p className="mt-1 text-sm text-slate-500">Add your pricing and available stock in a clear, compact layout.</p>
                                </div>
                                <div className="grid gap-4 lg:grid-cols-3">
                                    <label className="flex flex-col gap-2">
                                        <span className="text-sm font-medium text-slate-700">Actual Price (GHS)</span>
                                        <input type="number" name="mrp" onChange={onChangeHandler} value={productInfo.mrp} placeholder="0" className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-500 focus:bg-white" required />
                                    </label>

                                    <label className="flex flex-col gap-2">
                                        <span className="text-sm font-medium text-slate-700">Offer Price (GHS)</span>
                                        <input type="number" name="price" onChange={onChangeHandler} value={productInfo.price} placeholder="0" className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-500 focus:bg-white" required />
                                    </label>

                                    <label className="flex flex-col gap-2">
                                        <span className="text-sm font-medium text-slate-700">Quantity</span>
                                        <input type="number" name="quantity" onChange={onChangeHandler} value={productInfo.quantity} placeholder="0" min="0" className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-500 focus:bg-white" required />
                                    </label>
                                </div>

                                <label className="mt-4 flex flex-col gap-2">
                                    <span className="text-sm font-medium text-slate-700">Product Video (optional)</span>
                                    <input type="file" accept="video/*" onChange={e => setVideo(e.target.files[0])} className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-500 focus:bg-white" />
                                    <span className="text-xs text-slate-400">Upload a short video to show product usage or setup details.</span>
                                    {video && <span className="text-xs font-medium text-green-600">Selected: {video.name}</span>}
                                </label>
                            </section>

                            <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
                                <div className="mb-4">
                                    <h2 className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-600">Product Details</h2>
                                    <p className="mt-1 text-sm text-slate-500">Add a clear product title and a concise description for shoppers.</p>
                                </div>
                                <div className="flex flex-col gap-4">
                                    <label className="flex flex-col gap-2">
                                        <span className="text-sm font-medium text-slate-700">Name</span>
                                        <input type="text" name="name" onChange={onChangeHandler} value={productInfo.name} placeholder="Enter product name" className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-500 focus:bg-white" required />
                                    </label>

                                    <label className="flex flex-col gap-2">
                                        <span className="text-sm font-medium text-slate-700">Description</span>
                                        <textarea name="description" onChange={onChangeHandler} value={productInfo.description} placeholder="Enter product description" rows={5} className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-500 focus:bg-white" required />
                                    </label>
                                </div>
                            </section>

                            <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
                                <div className="mb-4">
                                    <h2 className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-600">Available Colors</h2>
                                    <p className="mt-1 text-sm text-slate-500">Select any colors that buyers can choose from for this product.</p>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {colorOptions.map((color) => {
                                        const selected = productInfo.availableColors.includes(color)
                                        return (
                                            <button
                                                key={color}
                                                type="button"
                                                onClick={() => toggleColor(color)}
                                                className={`rounded-full border px-3 py-2 text-sm transition ${selected ? 'border-slate-800 bg-slate-800 text-white' : 'border-slate-300 bg-white text-slate-600 hover:border-slate-400'}`}
                                            >
                                                {color}
                                            </button>
                                        )
                                    })}
                                </div>
                            </section>

                            <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
                                <div className="mb-4">
                                    <h2 className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-600">Product Category</h2>
                                    <p className="mt-1 text-sm text-slate-500">Choose an existing category or create a new one.</p>
                                </div>
                                <div className="flex flex-col gap-4">
                                    <label className="flex flex-col gap-2">
                                        <span className="text-sm font-medium text-slate-700">Category</span>
                                        <select onChange={e => setProductInfo({ ...productInfo, category: e.target.value })} value={productInfo.category} className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-500 focus:bg-white" required>
                                            <option value="">Select a category</option>
                                            {categories.map((category) => (
                                                <option key={category} value={category}>{category}</option>
                                            ))}
                                        </select>
                                    </label>

                                    <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                                        <input placeholder="New category name" value={newCategoryName} onChange={e => setNewCategoryName(e.target.value)} className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-500" />
                                        <button type="button" onClick={async () => {
                                            if(!newCategoryName) return toast.error('Enter a category name')
                                            try{
                                                const token = await getToken()
                                                const { data } = await axios.post('/api/store/category', { name: newCategoryName }, { headers: { Authorization: `Bearer ${token}` } })
                                                setCategories(prev => [data.category.name, ...prev])
                                                setProductInfo(prev => ({ ...prev, category: data.category.name }))
                                                setNewCategoryName('')
                                                toast.success('Category created successfully')
                                            }catch(err){
                                                if (err.response?.status === 409) {
                                                    toast.error(`Category "${newCategoryName}" already exists`)
                                                } else {
                                                    toast.error(err?.response?.data?.error || err.message)
                                                }
                                            }
                                        }} className="w-full rounded-2xl bg-slate-800 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-900">Create Category</button>

                                        <button type="button" onClick={async () => {
                                            try{
                                                const token = await getToken()
                                                const imageFile = images[1]
                                                let base64=null; let mimeType=null
                                                if(imageFile){
                                                    const reader = new FileReader()
                                                    const p = new Promise((res, rej) => {
                                                        reader.onloadend = () => res(reader.result)
                                                        reader.onerror = rej
                                                    })
                                                    reader.readAsDataURL(imageFile)
                                                    const result = await p
                                                    base64 = result.split(',')[1]
                                                    mimeType = imageFile.type
                                                }
                                                const body = { name: productInfo.name, description: productInfo.description, base64Image: base64, mimeType }
                                                const { data } = await axios.post('/api/store/ai-category', body, { headers: { Authorization: `Bearer ${token}` } })
                                                setAiSuggestion(data)
                                                if(data?.category) setProductInfo(prev=>({ ...prev, category: data.category }))
                                                if(data?.suggestedMrp) setProductInfo(prev=>({ ...prev, mrp: data.suggestedMrp }))
                                                if(data?.suggestedPrice) setProductInfo(prev=>({ ...prev, price: data.suggestedPrice }))
                                                toast.success('AI suggested category & prices')
                                            }catch(err){
                                                toast.error(err?.response?.data?.error || err.message)
                                            }
                                        }} className="w-full rounded-2xl bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-700">Generate with AI</button>
                                    </div>

                                    {aiSuggestion && (
                                        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                                            <p><span className="font-semibold text-slate-700">AI category:</span> {aiSuggestion.category}</p>
                                            <p><span className="font-semibold text-slate-700">Suggested MRP:</span> {aiSuggestion.suggestedMrp}</p>
                                            <p><span className="font-semibold text-slate-700">Suggested Price:</span> {aiSuggestion.suggestedPrice}</p>
                                        </div>
                                    )}
                                </div>
                            </section>
                        </div>

                        <div className="mt-8 flex flex-col items-start justify-between gap-4 border-t border-slate-200 pt-6 sm:flex-row sm:items-center">
                            <p className="text-sm text-slate-500">Your product will be published once you confirm the details above.</p>
                            <button disabled={loading} className="w-full rounded-2xl bg-slate-800 px-6 py-3 text-sm font-medium text-white transition hover:bg-slate-900 disabled:cursor-not-allowed disabled:opacity-70 sm:w-auto">{loading ? 'Adding Product...' : 'Add Product'}</button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    )
}