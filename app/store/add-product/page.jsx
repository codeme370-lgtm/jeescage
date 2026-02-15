'use client'

import { assets } from "@/assets/assets"
import Image from "next/image"
import { useState } from "react"
import { toast } from "react-hot-toast"
import { useAuth } from "@clerk/nextjs"
import axios from "axios"
import React from "react"
import { useEffect } from 'react'



export default function StoreAddProduct() {

    const [categories, setCategories] = useState(['Electronics', 'Clothing', 'Home & Kitchen', 'Beauty & Health', 'Toys & Games', 'Sports & Outdoors', 'Books & Media', 'Food & Drink', 'Hobbies & Crafts', 'Others'])
    const [newCategoryName, setNewCategoryName] = useState('')
    const [aiSuggestion, setAiSuggestion] = useState(null)

    const [images, setImages] = useState({ 1: null, 2: null, 3: null, 4: null })
    const [productInfo, setProductInfo] = useState({
        name: "",
        description: "",
        mrp: 0,
        price: 0,
        category: "",
    })
    const [loading, setLoading] = useState(false)
     const [aiUsed, setAiUsed] = useState(false)


    const {getToken} = useAuth()

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

            //create a form data that will be sent to the api
            const formData = new FormData()
            formData.append("name", productInfo.name)
            formData.append("description", productInfo.description)
            formData.append("mrp", productInfo.mrp)
            formData.append("price", productInfo.price)
            formData.append("category", productInfo.category)

            //adding image URLs to form data instead of files
            imageUrls.forEach((url) => {
                formData.append("imageUrls", url)
            })

            //send the form data to the api
            await axios.post("/api/store/product", formData, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })
            toast.success("Product added successfully")
            //reset the form
            setProductInfo({
                name: "",
                description: "",
                mrp: 0,
                price: 0,
                category: "",
            })
            //reset images
            setImages({ 1: null, 2: null, 3: null, 4: null })
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

            <div className="flex gap-5">
                <label htmlFor="" className="flex flex-col gap-2 ">
                    Actual Price (GHS)
                    <input type="number" name="mrp" onChange={onChangeHandler} value={productInfo.mrp} placeholder="0" rows={5} className="w-full max-w-45 p-2 px-4 outline-none border border-slate-200 rounded resize-none" required />
                </label>
                <label htmlFor="" className="flex flex-col gap-2 ">
                    Offer Price (GHS)
                    <input type="number" name="price" onChange={onChangeHandler} value={productInfo.price} placeholder="0" rows={5} className="w-full max-w-45 p-2 px-4 outline-none border border-slate-200 rounded resize-none" required />
                </label>
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
                        const token = await getToken()
                        const { data } = await axios.post('/api/store/category', { name: newCategoryName }, { headers: { Authorization: `Bearer ${token}` } })
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
                        const token = await getToken()
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
                        const { data } = await axios.post('/api/store/ai-category', body, { headers: { Authorization: `Bearer ${token}` } })
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