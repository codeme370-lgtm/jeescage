'use client'

import { useEffect, useState } from "react"
import { toast } from "react-hot-toast"
import Image from "next/image"
import Loading from "@/components/Loading"
import { useAuth } from "@/context/AuthContext"
import axios from "axios"
import { Pencil, Check, X } from "lucide-react"
import { Trash2 } from "lucide-react"


export default function AdminManageProducts() {

    const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || 'GHS'

    const {getToken} = useAuth()

    const [loading, setLoading] = useState(true)
    const [products, setProducts] = useState([])
    const [editingProductId, setEditingProductId] = useState(null)
    const [editValues, setEditValues] = useState({ name: '', price: '', quantity: '' })
    const [originalValues, setOriginalValues] = useState({ name: '', price: '', quantity: '' })
    const [savingEdit, setSavingEdit] = useState(false)

    const fetchProducts = async () => {
        try {
            //let's get the token
            const token = await getToken()
            const {data} = await axios.get("/api/admin/product", {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })
            setProducts(data.products.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)))
        } catch (error) {
            toast.error(error?.response?.data?.message || "Something went wrong while fetching products")
        } 
        setLoading(false)
    }

    const toggleStock = async (productId) => {
        // Logic to toggle the stock of a product
        try {
            const token = await getToken()
            const {data} = await axios.post(`/api/admin/product/stock-toggle`, {productId}, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })
            setProducts(prevProducts => prevProducts.map(product => product.id === productId ? {...product, inStock: !product.inStock} : product))
            toast.success(data.message)


        } catch (error) {
            toast.error(error?.response?.data?.message || "Something went wrong while updating stock status") 
        }
    }

    const startEditing = (product) => {
        setEditingProductId(product.id)
        const values = { name: product.name, price: product.price, quantity: product.quantity }
        setEditValues(values)
        setOriginalValues(values)
    }

    const cancelEditing = () => {
        setEditingProductId(null)
        setEditValues({ name: '', price: '', quantity: '' })
        setOriginalValues({ name: '', price: '', quantity: '' })
    }

    const resetEditing = () => {
        setEditValues(originalValues)
    }

    const saveProductEdit = async (productId) => {
        if (!editValues.name || editValues.price === '' || isNaN(Number(editValues.price)) || editValues.quantity === '' || isNaN(Number(editValues.quantity))) {
            return toast.error('Please enter valid name, price, and quantity')
        }

        try {
            setSavingEdit(true)
            const token = await getToken()
            const { data } = await axios.patch('/api/admin/product', {
                productId,
                name: editValues.name,
                price: Number(editValues.price),
                quantity: Number(editValues.quantity)
            }, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })

            setProducts(prevProducts => prevProducts.map(product => product.id === productId ? data.product : product))
            toast.success(data.message)
            cancelEditing()
        } catch (error) {
            toast.error(error?.response?.data?.message || "Something went wrong while updating product")
        } finally {
            setSavingEdit(false)
        }
    }

    const deleteProduct = async (productId) => {
        if (!confirm("Are you sure you want to delete this product? This action cannot be undone.")) return;
        try {
            const token = await getToken()
            const {data} = await axios.delete(`/api/admin/product`, {
                headers: {
                    Authorization: `Bearer ${token}`
                },
                data: { productId }
            })
            setProducts(prevProducts => prevProducts.filter(product => product.id !== productId))
            toast.success(data.message)
        } catch (error) {
            toast.error(error?.response?.data?.message || "Something went wrong while deleting product")
        }
    }

    useEffect(() => {
        fetchProducts()
    }, [])

    if (loading) return <Loading />

    return (
        <>
            <h1 className="text-2xl text-slate-500 mb-5">Manage <span className="text-slate-800 font-medium">Products</span></h1>
            <table className="w-full max-w-4xl text-left  ring ring-slate-200  rounded overflow-hidden text-sm">
                <thead className="bg-slate-50 text-gray-700 uppercase tracking-wider">
                    <tr>
                        <th className="px-4 py-3">Name</th>
                        <th className="px-4 py-3 hidden md:table-cell">Store</th>
                        <th className="px-4 py-3 hidden md:table-cell">Description</th>
                        <th className="px-4 py-3 hidden md:table-cell">MRP</th>
                        <th className="px-4 py-3">Price</th>
                        <th className="px-4 py-3">Quantity</th>
                        <th className="px-4 py-3">Actions</th>
                    </tr>
                </thead>
                <tbody className="text-slate-700">
                    {products.map((product) => (
                        <tr key={product.id} className="border-t border-gray-200 hover:bg-gray-50">
                            <td className="px-4 py-3">
                                <div className="flex gap-2 items-center">
                                    <Image width={40} height={40} className='p-1 shadow rounded cursor-pointer' src={product.images[0]} alt={product?.name ? `${product.name} image` : 'Product image'} />
                                    {editingProductId === product.id ? (
                                        <input
                                            value={editValues.name}
                                            onChange={e => setEditValues(prev => ({ ...prev, name: e.target.value }))}
                                            className="w-full px-2 py-1 border border-slate-200 rounded"
                                        />
                                    ) : (
                                        product.name
                                    )}
                                </div>
                            </td>
                            <td className="px-4 py-3 hidden md:table-cell text-slate-600">{product.store?.name || product.storeId}</td>
                            <td className="px-4 py-3 max-w-md text-slate-600 hidden md:table-cell truncate">{product.description}</td>
                            <td className="px-4 py-3 hidden md:table-cell">{currency} {product.mrp.toLocaleString()}</td>
                            <td className="px-4 py-3">
                                {editingProductId === product.id ? (
                                    <input
                                        value={editValues.price}
                                        onChange={e => setEditValues(prev => ({ ...prev, price: e.target.value }))}
                                        className="w-20 px-2 py-1 border border-slate-200 rounded"
                                    />
                                ) : (
                                    `${currency} ${product.price.toLocaleString()}`
                                )}
                            </td>
                            <td className="px-4 py-3">
                                {editingProductId === product.id ? (
                                    <input
                                        type="number"
                                        value={editValues.quantity}
                                        onChange={e => setEditValues(prev => ({ ...prev, quantity: e.target.value }))}
                                        className="w-20 px-2 py-1 border border-slate-200 rounded"
                                        min="0"
                                    />
                                ) : (
                                    product.quantity
                                )}
                            </td>
                            <td className="px-4 py-3 text-center">
                                <div className="flex items-center justify-center gap-2">
                                    <label className="relative inline-flex items-center cursor-pointer text-gray-900">
                                        <input type="checkbox" className="sr-only peer" onChange={() => toast.promise(toggleStock(product.id), { loading: "Updating data..." })} checked={product.inStock} />
                                        <div className="w-9 h-5 bg-slate-300 rounded-full peer peer-checked:bg-red-600 transition-colors duration-200"></div>
                                        <span className="dot absolute left-1 top-1 w-3 h-3 bg-white rounded-full transition-transform duration-200 ease-in-out peer-checked:translate-x-4"></span>
                                    </label>

                                    {editingProductId === product.id ? (
                                        <>
                                            <button
                                                onClick={() => saveProductEdit(product.id)}
                                                disabled={savingEdit}
                                                className="text-green-600 hover:text-green-800 transition-colors"
                                                title="Save changes"
                                            >
                                                <Check size={18} />
                                            </button>
                                            <button
                                                onClick={resetEditing}
                                                className="text-yellow-600 hover:text-yellow-800 transition-colors"
                                                title="Reset to original"
                                            >
                                                ↺
                                            </button>
                                            <button
                                                onClick={cancelEditing}
                                                className="text-gray-500 hover:text-gray-700 transition-colors"
                                                title="Cancel"
                                            >
                                                <X size={18} />
                                            </button>
                                        </>
                                    ) : (
                                        <button
                                            onClick={() => startEditing(product)}
                                            className="text-blue-500 hover:text-blue-700 transition-colors"
                                            title="Edit product"
                                        >
                                            <Pencil size={18} />
                                        </button>
                                    )}

                                    <button
                                        onClick={() => deleteProduct(product.id)}
                                        className="text-red-500 hover:text-red-700 transition-colors"
                                        title="Delete product"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </>
    )
}
