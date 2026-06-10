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
  const [categories, setCategories] = useState([
    'Electronics',
    'Clothing',
    'Home & Kitchen',
    'Beauty & Health',
    'Toys & Games',
    'Sports & Outdoors',
    'Books & Media',
    'Food & Drink',
    'Hobbies & Crafts',
    'Others',
  ])
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
    { name: 'Gold', hex: '#D97706' },
  ]

  const [images, setImages] = useState({ 1: null, 2: null, 3: null, 4: null })
  const [video, setVideo] = useState(null)
  const [productInfo, setProductInfo] = useState({
    name: '',
    description: '',
    mrp: 0,
    price: 0,
    category: '',
    quantity: 0,
    availableColors: [],
  })
  const [showColors, setShowColors] = useState(false)
  const [loading, setLoading] = useState(false)
  const [aiUsed, setAiUsed] = useState(false)

  const toggleColor = (color) => {
    setProductInfo((prev) => {
      const hasColor = prev.availableColors.includes(color)
      return {
        ...prev,
        availableColors: hasColor ? prev.availableColors.filter((c) => c !== color) : [...prev.availableColors, color],
      }
    })
  }

  const dispatch = useDispatch()

  useEffect(() => {
    const fetchCats = async () => {
      try {
        const { data } = await axios.get('/api/admin/product/category')
        if (data?.categories) setCategories((prev) => Array.from(new Set([...data.categories.map((c) => c.name), ...prev])))
      } catch (e) {
        /* ignore */
      }
    }
    fetchCats()
  }, [])

  const onChangeHandler = (e) => setProductInfo({ ...productInfo, [e.target.name]: e.target.value })

  const handleImageUpload = async (key, file) => {
    setImages((prev) => ({ ...prev, [key]: file }))
    if (key == '1' && file && !aiUsed) {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onloadend = async () => {
        const base64String = reader.result.split(',')[1]
        const mimeType = file.type
        try {
          await toast.promise(
            axios.post(
              '/api/admin/product/ai',
              { base64Image: base64String, mimeType },
              { withCredentials: true }
            ),
            {
              loading: 'Analyzing image with AI....',
              success: (res) => {
                const data = res.data
                if (data.name && data.description) {
                  setProductInfo((prev) => ({ ...prev, name: data.name, description: data.description }))
                  setAiUsed(true)
                  return 'AI filled product info'
                }
                return 'AI could not analyze the image'
              },
              error: (err) => err?.response?.data?.error || err.message,
            }
          )
        } catch (err) {
          console.error(err)
        }
      }
    }
  }

  const onSubmitHandler = async (e) => {
    e.preventDefault()
    try {
      if (!images[1] && !images[2] && !images[3] && !images[4]) return toast.error('Please upload at least one product image')
      setLoading(true)

      const imageUrls = []
      for (const key in images) {
        if (images[key]) {
          const uploadFormData = new FormData()
          uploadFormData.append('file', images[key])
          const uploadResponse = await axios.post('/api/admin/product/upload', uploadFormData, { withCredentials: true })
          imageUrls.push(uploadResponse.data.imageUrl)
        }
      }

      let videoUrl = null
      if (video) {
        const videoFormData = new FormData()
        videoFormData.append('file', video)
        const videoResponse = await axios.post('/api/admin/product/upload', videoFormData, { withCredentials: true })
        videoUrl = videoResponse.data.mediaUrl
      }

      const formData = new FormData()
      formData.append('name', productInfo.name)
      formData.append('description', productInfo.description)
      formData.append('mrp', productInfo.mrp)
      formData.append('price', productInfo.price)
      formData.append('category', productInfo.category)
      formData.append('quantity', productInfo.quantity)
      productInfo.availableColors.forEach((color) => formData.append('availableColors', color))
      imageUrls.forEach((url) => formData.append('imageUrls', url))
      if (videoUrl) formData.append('videoUrl', videoUrl)

      const response = await axios.post('/api/admin/product', formData, { withCredentials: true })
      toast.success('Product added successfully')
      if (response.data.product) dispatch(addProduct(response.data.product))

      setProductInfo({ name: '', description: '', mrp: 0, price: 0, category: '', quantity: 0, availableColors: [] })
      setImages({ 1: null, 2: null, 3: null, 4: null })
      setVideo(null)
    } catch (error) {
      toast.error(error.response?.data?.message || 'Something went wrong while adding the product')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-100/90 py-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 text-center">
          <span className="inline-block rounded-full bg-slate-800 px-4 py-1 text-xs uppercase tracking-[0.3em] text-white shadow-sm">Admin Panel</span>
          <h1 className="mt-4 text-4xl font-semibold text-slate-900 tracking-tight">Create a New Product</h1>
          <p className="mx-auto mt-3 max-w-2xl text-base text-slate-600">Use the form below to add a product with clear field groups, a smooth animated layout, and a visible color palette.</p>
        </div>

        <form onSubmit={(e) => toast.promise(onSubmitHandler(e), { loading: 'Adding Product...' })} className="animate-addProductForm space-y-8">
          <div className="rounded-[2rem] border border-slate-200 bg-white/95 shadow-2xl shadow-slate-200/70 backdrop-blur-xl p-8 transition-all duration-500 ease-out">
            <div className="grid gap-10 lg:grid-cols-[1.3fr_0.95fr]">
              <div className="space-y-8">
                <section className="rounded-3xl border border-slate-200 bg-slate-50/70 p-6 shadow-sm transition-transform duration-300 hover:-translate-y-1">
                  <h2 className="text-lg font-semibold text-slate-900 mb-4">Product Media</h2>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {Object.keys(images).map((key) => (
                      <label key={key} htmlFor={`images${key}`} className="group relative overflow-hidden rounded-3xl border border-dashed border-slate-300 bg-white p-3 text-center transition hover:border-slate-400 hover:shadow-md">
                        <div className="flex h-32 items-center justify-center bg-slate-100">
                          <Image width={300} height={300} className="h-full w-auto object-contain" src={images[key] ? URL.createObjectURL(images[key]) : assets.upload_area} alt={images[key] ? `Product image ${key} preview` : 'Upload placeholder'} />
                        </div>
                        <input type="file" accept="image/*" id={`images${key}`} onChange={(e) => handleImageUpload(key, e.target.files[0])} hidden />
                        <div className="mt-2 text-sm text-slate-500">Upload image {key}</div>
                      </label>
                    ))}
                  </div>
                </section>

                <section className="rounded-3xl border border-slate-200 bg-slate-50/70 p-6 shadow-sm transition-transform duration-300 hover:-translate-y-1">
                  <h2 className="text-lg font-semibold text-slate-900 mb-4">Product Details</h2>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Name</label>
                  <input type="text" name="name" onChange={onChangeHandler} value={productInfo.name} placeholder="Enter product name" className="w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition duration-300 ease-in-out focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10" required />

                  <label className="mt-6 block text-sm font-medium text-slate-700 mb-2">Description</label>
                  <textarea name="description" onChange={onChangeHandler} value={productInfo.description} placeholder="Enter product description" rows={5} className="w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition duration-300 ease-in-out focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 resize-none" required />

                  <label className="mt-6 block text-sm font-medium text-slate-700 mb-2">Product Video (optional)</label>
                  <input type="file" accept="video/*" onChange={(e) => setVideo(e.target.files[0])} className="w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition duration-300 ease-in-out focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10" />
                  <p className="mt-2 text-sm text-slate-500">Optional video for product usage or buyer guidance.</p>
                  {video && <p className="mt-2 text-sm text-green-600">Selected: {video.name}</p>}
                </section>
              </div>

              <div className="space-y-8">
                <section className="rounded-3xl border border-slate-200 bg-slate-50/70 p-6 shadow-sm transition-transform duration-300 hover:-translate-y-1">
                  <h2 className="text-lg font-semibold text-slate-900 mb-4">Pricing & Inventory</h2>
                  <div className="grid gap-4 sm:grid-cols-3">
                    <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
                      Actual Price (GHS)
                      <input type="number" name="mrp" onChange={onChangeHandler} value={productInfo.mrp} placeholder="0" className="rounded-3xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition duration-300 ease-in-out focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10" required />
                    </label>
                    <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
                      Offer Price (GHS)
                      <input type="number" name="price" onChange={onChangeHandler} value={productInfo.price} placeholder="0" className="rounded-3xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition duration-300 ease-in-out focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10" required />
                    </label>
                    <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
                      Quantity
                      <input type="number" name="quantity" onChange={onChangeHandler} value={productInfo.quantity} placeholder="0" min="0" className="rounded-3xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition duration-300 ease-in-out focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10" required />
                    </label>
                  </div>
                </section>

                <section className="rounded-3xl border border-slate-200 bg-slate-50/70 p-6 shadow-sm transition-transform duration-300 hover:-translate-y-1">
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <h2 className="text-lg font-semibold text-slate-900">Available Colors</h2>
                        <p className="text-sm text-slate-500">Optional field. Customers only need to select a color when you provide options.</p>
                      </div>
                      <label className="inline-flex items-center gap-2 text-sm font-medium text-slate-700">
                        <input
                          type="checkbox"
                          checked={showColors}
                          onChange={() => {
                            const next = !showColors
                            setShowColors(next)
                            if (!next) setProductInfo((prev) => ({ ...prev, availableColors: [] }))
                          }}
                          className="h-4 w-4 rounded border-slate-300 text-slate-900"
                        />
                        Add color options
                      </label>
                    </div>
                    {showColors ? (
                      <>
                        <div className="grid grid-cols-6 gap-3">
                          {colorPalette.map((c) => {
                            const selected = productInfo.availableColors.includes(c.name)
                            return (
                              <button
                                type="button"
                                key={c.name}
                                onClick={() => toggleColor(c.name)}
                                className={`flex h-10 w-10 items-center justify-center rounded-full border ${selected ? 'ring-2 ring-offset-1 ring-slate-900' : 'border-slate-200'}`}
                                style={{ background: c.hex }}
                                aria-label={c.name}
                              />
                            )
                          })}
                        </div>
                        <p className="mt-3 text-sm text-slate-500">Select one or more colors that buyers can choose from.</p>
                      </>
                    ) : (
                      <p className="mt-3 text-sm text-slate-500">Color options are disabled for this product. Buyers can purchase without choosing a color.</p>
                    )}
                  </div>
                </section>

                <section className="rounded-3xl border border-slate-200 bg-slate-50/70 p-6 shadow-sm transition-transform duration-300 hover:-translate-y-1">
                  <h2 className="text-lg font-semibold text-slate-900 mb-4">Category</h2>
                  <div className="flex gap-3">
                    <select name="category" onChange={onChangeHandler} value={productInfo.category} className="rounded-3xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none">
                      <option value="">Select Category</option>
                      {categories.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                    <input type="text" placeholder="New category" value={newCategoryName} onChange={(e) => setNewCategoryName(e.target.value)} className="rounded-3xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none" />
                    <button
                      type="button"
                      onClick={async () => {
                        if (!newCategoryName) return
                        try {
                          const { data } = await axios.post('/api/admin/product/category', { name: newCategoryName })
                          if (data?.success) {
                            setCategories((prev) => [newCategoryName, ...prev])
                            setNewCategoryName('')
                            toast.success('Category added')
                          }
                        } catch (err) {
                          toast.error('Could not add category')
                        }
                      }}
                      className="rounded-3xl bg-slate-900 px-4 py-3 text-white"
                    >
                      Add
                    </button>
                  </div>
                </section>

                <div className="flex items-center justify-between">
                  <button type="submit" disabled={loading} className="rounded-3xl bg-slate-900 px-6 py-3 text-white disabled:opacity-50">
                    {loading ? 'Adding...' : 'Add Product'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setProductInfo({ name: '', description: '', mrp: 0, price: 0, category: '', quantity: 0, availableColors: [] })
                      setImages({ 1: null, 2: null, 3: null, 4: null })
                      setVideo(null)
                    }}
                    className="rounded-3xl border border-slate-200 px-6 py-3"
                  >
                    Reset
                  </button>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
    