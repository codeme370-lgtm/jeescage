'use client'
import { XIcon } from "lucide-react"
import { useState, useEffect } from "react"
import { createPortal } from "react-dom"
import { toast } from "react-hot-toast"
import { useAuth } from "@/context/AuthContext"
import { useDispatch } from "react-redux"
import axios from "axios"
import { addAddress } from "@/lib/features/address/addressSlice"



const AddressModal = ({ setShowAddressModal, onSuccess }) => {
    //address state
    const {getToken} = useAuth()
    const dispatch = useDispatch()
    const [mounted, setMounted] = useState(false)
    const [address, setAddress] = useState({
        name: '',
        street: '',
        city: '',
        phone: ''
    })

    useEffect(() => {
        setMounted(true)
        return () => setMounted(false)
    }, [])

    const handleAddressChange = (e) => {
        setAddress({
            ...address,
            [e.target.name]: e.target.value
        })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        try {
            //generate the token
            const token = await getToken()
            if(!token){
                toast.error('Authentication failed. Please sign in and try again.')
                return
            }
            //let's get the data from the api
            const {data} = await axios.post('/api/address', address, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })
            dispatch(addAddress(data.newAddress))
            if (onSuccess) onSuccess(data.newAddress)
            toast.success(data.message)
            setShowAddressModal(false)
        } catch (error) {
            console.log(error)
            toast.error(error?.response?.data?.message || "Something went wrong while adding address")
        }
    }

    if (!mounted) return null

    const modal = (
        <div onClick={() => setShowAddressModal(false)} className="fixed inset-0 z-50 bg-white/60 backdrop-blur h-screen flex items-center justify-center">
            <form onSubmit={e => toast.promise(handleSubmit(e), { loading: 'Adding Address...' })} onClick={e => e.stopPropagation()} className="flex flex-col gap-5 text-slate-700 w-full max-w-sm mx-6">
                <h2 className="text-3xl ">Add New <span className="font-semibold">Address</span></h2>
                <input name="name" onChange={handleAddressChange} value={address.name} className="p-2 px-4 outline-none border border-slate-200 rounded w-full" type="text" placeholder="Enter your name" required />
                <input name="street" onChange={handleAddressChange} value={address.street} className="p-2 px-4 outline-none border border-slate-200 rounded w-full" type="text" placeholder="Street" required />
                <div className="flex gap-4">
                    <input name="city" onChange={handleAddressChange} value={address.city} className="p-2 px-4 outline-none border border-slate-200 rounded w-full" type="text" placeholder="City" required />
                    <input name="phone" onChange={handleAddressChange} value={address.phone} className="p-2 px-4 outline-none border border-slate-200 rounded w-full" type="text" placeholder="Phone" required />
                </div>
                <button className="bg-slate-800 text-white text-sm font-medium py-2.5 rounded-md hover:bg-slate-900 active:scale-95 transition-all">SAVE ADDRESS</button>
            </form>
            <XIcon size={30} className="absolute top-5 right-5 text-slate-500 hover:text-slate-700 cursor-pointer" onClick={() => setShowAddressModal(false)} />
        </div>
    )

    return createPortal(modal, document.body)
}

export default AddressModal