'use client'

import { assets } from "@/assets/assets"
import Image from "next/image"
import { useState } from "react"
import { toast } from "react-hot-toast"
import axios from "axios"
import React from "react"
import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { addProduct } from '@/lib/features/product/productSlice'



export default function AdminAddProduct() {

    const [categories, setCategories] = useState(['Electronics', 'Clothing', 'Home & Kitchen', 'Beauty & Health', 'Toys & Games', 'Sports & Outdoors', 'Books & Media', 'Food & Drink', 'Hobbies & Crafts', 'Others'])
    const [newCategoryName, setNewCategoryName] = useState('')
    const [aiSuggestion, setAiSuggestion] = useState(null)

    const colorPalette = [
        { name: 'Black', hex: '#000000' },
        { name: 'White', hex: '#FFFFFF' },
        { name: 'Gray', hex: '#9CA3AF' },
        { name: 'Red', hex: '#EF4444' },
        { name: 'Pink', hex: '#F472B6' },
        { name: 'Orange', hex: '#F59E0B' },
        { name: 'Yellow', hex: '#EAB308' },
        { name: 'Lime', hex: '#84CC16' },
        { name: 'Green', hex: '#22C55E' },
        { name: 'Teal', hex: '#14B8A6' },
        { name: 'Cyan', hex: '#06B6D4' },
        { name: 'Blue', hex: '#3B82F6' },
        { name: 'Indigo', hex: '#6366F1' },
        { name: 'Violet', hex: '#8B5CF6' },
        { name: 'Purple', hex: '#A855F7' },
        { name: 'Fuchsia', hex: '#D946EF' },
        { name: 'Rose', hex: '#FB7185' },
        { name: 'Brown', hex: '#92400E' },
        { name: 'Tan', hex: '#D8B4FE' },
        { name: 'Beige', hex: '#F5F5DC' },
        { name: 'Navy', hex: '#1D4ED8' },
        { name: 'Olive', hex: '#6B7280' },
        { name: 'Maroon', hex: '#7F1D1D' },
        { name: 'Gold', hex: '#D97706' }
    ]

    const [images, setImages] = useState({ 1: null, 2: null, 3: null, 4: null })
    const [video, setVideo] = useState(null)
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

    const toggleColor = (color) => {
        setProductInfo((prev) => {
            const hasColor = prev.availableColors.includes(color)
            return {
                ...prev,
                availableColors: hasColor
                    ? prev.availableColors.filter((item) => item !== color)
                    : [...prev.availableColors, color],
            }
        })
    }

    const dispatch = useDispatch()

    useEffect(() => {
        const fetchCats = async () => {
            try {
                const { data } = await axios.get('/api/admin/product/category')
                if (data?.categories) setCategories(prev => Array.from(new Set([...data.categories.map(c=>c.name), ...prev])))
            } catch (e) { /* ignore */ }
        }
        fetchCats()
    }, [])


    const onChangeHandler = (e) => {
        setProductInfo({ ...productInfo, [e.target.name]: e.target.value })
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

                try {
                    await toast.promise(
                        axios.post('/api/admin/product/ai', { base64Image: base64String, mimeType }, { withCredentials: true }),
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

            const imageUrls = []
            for(const key in images){
                if(images[key]){
                    const uploadFormData = new FormData()
                    uploadFormData.append("file", images[key])
                    
                    const uploadResponse = await axios.post('/api/admin/product/upload', uploadFormData, { withCredentials: true })
                    imageUrls.push(uploadResponse.data.imageUrl)
                }
            }

            let videoUrl = null
            if (video) {
                const videoFormData = new FormData()
                videoFormData.append("file", video)
                
                const videoResponse = await axios.post('/api/admin/product/upload', videoFormData, { withCredentials: true })
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
            const response = await axios.post("/api/admin/product", formData, { withCredentials: true })
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
        <form onSubmit={e => toast.promise(onSubmitHandler(e), { loading: "Adding Product..." })} className="text-slate-500 mb-28">
            <h1 className="text-2xl">Add New <span className="text-slate-800 font-medium">Products</span></h1>
            <p className="mt-7">Product Images</p>

            <div htmlFor="" className="flex gap-3 mt-4">
                {Object.keys(images).map((key) => (
                    <label key={key} htmlFor={`images${key}`}>
                        <Image width={300} height={300} className='h-15 w-auto border border-slate-200 rounded cursor-pointer' src={images[key] ? URL.createObjectURL(images[key]) : assets.upload_area} alt={images[key] ? `Product image ${key} preview` : 'Upload placeholder'} />
                        <input type="file" accept='image/*' id={`images${key}`}
                         onChange={e => handleImageUpload(key, e.target.files[0])}
                          hidden />
                    </label>
                ))}
            </div>

            <label htmlFor="" className="flex flex-col gap-2 my-6 ">
                Name
                <input type="text" name="name" onChange={onChangeHandler} value={productInfo.name} placeholder="Enter product name" className="w-full max-w-sm p-2 px-4 outline-none border border-slate-200 rounded" required />
            </label>

            <label htmlFor="" className="flex flex-col gap-2 my-6 ">
                Description
                <textarea name="description" onChange={onChangeHandler} value={productInfo.description} placeholder="Enter product description" rows={5} className="w-full max-w-sm p-2 px-4 outline-none border border-slate-200 rounded resize-none" required />
            </label>

            <label htmlFor="" className="flex flex-col gap-2 my-6 ">
                Product Video (optional)
                <input type="file" accept="video/*" onChange={e => setVideo(e.target.files[0])} className="w-full max-w-sm p-2 px-4 outline-none border border-slate-200 rounded" />
                <span className="text-xs text-slate-400">Upload a video for product usage, installment details, or buyer guidance.</span>
                {video && <span className="text-xs text-green-600">Selected: {video.name}</span>}
            </label>

            <div className="flex gap-5">
                <label htmlFor="" className="flex flex-col gap-2 ">
                    Actual Price (GHS)
                    <input type="number" name="mrp" onChange={onChangeHandler} value={productInfo.mrp} placeholder="0" rows={5} className="w-full max-w-45 p-2 px-4 outline-none border border-slate-200 rounded resize-none" required />
                </label>
                <label htmlFor="" className="flex flex-col gap-2 ">
                    Offer Price (GHS)
                    <input type="number" name="price" onChange={onChangeHandler} value={productInfo.price} placeholder="0" rows={5} className="w-full max-w-45 p-2 px-4 outline-none border border-slate-200 rounded resize-none" required />
                </label>
                <label htmlFor="" className="flex flex-col gap-2 ">
                    Quantity
                    <input type="number" name="quantity" onChange={onChangeHandler} value={productInfo.quantity} placeholder="0" min="0" className="w-full max-w-45 p-2 px-4 outline-none border border-slate-200 rounded resize-none" required />
                </label>
            </div>

            <div className="mb-6 max-w-sm">
                <label className="block text-sm font-semibold text-slate-700 mb-2">Available Colors</label>

                <div className="grid grid-cols-6 gap-2 mb-3 max-w-md">
                    {colorPalette.map((color) => {
                        const selected = productInfo.availableColors.includes(color.name)
                        return (
                            <button
                                key={color.name}
                                type="button"
                                onClick={() => toggleColor(color.name)}
                                className={`h-10 w-10 rounded-full border transition-all ${selected ? 'border-slate-900 ring-2 ring-slate-900' : 'border-slate-200'}`}
                                style={{ backgroundColor: color.hex }}
                                aria-label={color.name}
                            >
                                <span className="sr-only">{color.name}</span>
                            </button>
                        )
                    })}
                </div>

                <div className="flex flex-wrap gap-2 mb-3">
                    {productInfo.availableColors.map((color) => (
                        <span key={color} className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-slate-100 px-3 py-1 text-sm text-slate-700">
                            {color}
                            <button
                                type="button"
                                onClick={() => toggleColor(color)}
                                className="text-red-500 hover:text-red-700 focus:outline-none"
                            >
                                ×
                            </button>
                        </span>
                    ))}
                </div>

                <p className="text-xs text-slate-500 mt-2">Select one or more colors from the palette.</p>
            </div>

            <select onChange={e => setProductInfo({ ...productInfo, category: e.target.value })} value={productInfo.category} className="w-full max-w-sm p-2 px-4 my-6 outline-none border border-slate-200 rounded" required>
                <option value="">Select a category</option>
                {categories.map((category) => (
                    <option key={category} value={category}>{category}</option>
                ))}
            </select>

            <div className="flex items-center gap-3 mt-2">
                <input placeholder="New category name" value={newCategoryName} onChange={e => setNewCategoryName(e.target.value)} className="border p-2 rounded" />
                <button type="button" onClick={async () => {
                    if(!newCategoryName) return toast.error('Enter a category name')
                    try{
                        const { data } = await axios.post('/api/admin/product/category', { name: newCategoryName })
                        setCategories(prev => [data.category.name, ...prev])
                        setProductInfo(prev => ({ ...prev, category: data.category.name }))
                        setNewCategoryName('')
                        toast.success('Category created')
                    }catch(err){
                        toast.error(err?.response?.data?.error || err.message)
                    }
                }} className="bg-slate-800 text-white px-3 py-2 rounded">Create Category</button>

                <button type="button" onClick={async () => {
                    try{
                        // call ai-category endpoint with product name/description or image (first image)
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
                        const { data } = await axios.post('/api/admin/product/ai-category', body)
                        setAiSuggestion(data)
                        if(data?.category) setProductInfo(prev=>({ ...prev, category: data.category }))
                        if(data?.suggestedMrp) setProductInfo(prev=>({ ...prev, mrp: data.suggestedMrp }))
                        if(data?.suggestedPrice) setProductInfo(prev=>({ ...prev, price: data.suggestedPrice }))
                        toast.success('AI suggested category & prices')
                    }catch(err){
                        toast.error(err?.response?.data?.error || err.message)
                    }
                }} className="bg-indigo-600 text-white px-3 py-2 rounded">Generate with AI</button>
            </div>

            {aiSuggestion && (
                <div className="mt-3 p-3 bg-slate-50 border border-slate-200 rounded">
                    <p><strong>AI category:</strong> {aiSuggestion.category}</p>
                    <p><strong>Suggested MRP:</strong> {aiSuggestion.suggestedMrp}</p>
                    <p><strong>Suggested Price:</strong> {aiSuggestion.suggestedPrice}</p>
                </div>
            )}

            <br />

            <button disabled={loading} className="bg-slate-800 text-white px-6 mt-7 py-2 hover:bg-slate-900 rounded transition">Add Product</button>
        </form>
    )
}
