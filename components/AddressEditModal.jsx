'use client'
import { XIcon, Loader } from "lucide-react"
import { useEffect, useState } from "react"
import { createPortal } from "react-dom"
import axios from "axios"
import AddressModal from "./AddressModal"
import { useAuth } from "@/context/AuthContext"
import toast from "react-hot-toast"

const AddressEditModal = ({ address, orderId, orderStatus, onClose, onAddressUpdated }) => {
    const [mounted, setMounted] = useState(false)
    const [userAddresses, setUserAddresses] = useState([])
    const [selectedAddressId, setSelectedAddressId] = useState(address?.id || '')
    const [loading, setLoading] = useState(false)
    const [isLoadingAddresses, setIsLoadingAddresses] = useState(true)
    const [showNewAddressModal, setShowNewAddressModal] = useState(false)
    const { getToken } = useAuth()

    // Check if order can be edited
    const canEditAddress = orderStatus !== "SHIPPED" && orderStatus !== "DELIVERED"

    useEffect(() => {
        setMounted(true)
        return () => setMounted(false)
    }, [])

    useEffect(() => {
        const fetchAddresses = async () => {
            try {
                const token = await getToken()
                const { data } = await axios.get('/api/address', {
                    headers: { Authorization: `Bearer ${token}` }
                })
                setUserAddresses(data.addresses || [])
                setSelectedAddressId(address?.id || (data.addresses[0]?.id || ''))
            } catch (error) {
                console.error("Error fetching addresses:", error)
                toast.error("Failed to load addresses")
            } finally {
                setIsLoadingAddresses(false)
            }
        }
        
        if (mounted && canEditAddress) {
            fetchAddresses()
        }
    }, [mounted, canEditAddress, getToken, address?.id])

    const handleUpdateAddress = async () => {
        if (!selectedAddressId) {
            toast.error("Please select an address")
            return
        }

        if (selectedAddressId === address?.id) {
            toast.error("Please select a different address")
            return
        }

        setLoading(true)
        try {
            const token = await getToken()
            const { data } = await axios.post('/api/orders/update-address', {
                orderId,
                newAddressId: selectedAddressId
            }, {
                headers: { Authorization: `Bearer ${token}` }
            })
            
            toast.success("Address updated successfully! The store has been notified.")
            onAddressUpdated?.(data.order)
            onClose()
        } catch (error) {
            console.error("Error updating address:", error)
            const errorMsg = error?.response?.data?.error || error?.message || "Failed to update address"
            toast.error(errorMsg)
        } finally {
            setLoading(false)
        }
    }

    if (!mounted) return null
    if (!address) return null

    const handleAddressAdded = (newAddr) => {
        setUserAddresses(prev => [newAddr, ...prev])
        setSelectedAddressId(newAddr.id)
    }

    const displayAddress = userAddresses.find(addr => addr.id === selectedAddressId) || address

    const modal = (
        <div onClick={onClose} className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
            <div onClick={e => e.stopPropagation()} className="bg-white rounded-lg shadow-lg max-w-md w-full p-6 text-slate-700">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">Edit Delivery Address</h3>
                    <XIcon size={22} className="cursor-pointer text-slate-500" onClick={onClose} />
                </div>

                {!canEditAddress ? (
                    <div className="text-center py-6">
                        <p className="text-red-500 font-medium mb-2">Cannot Edit Address</p>
                        <p className="text-sm text-slate-600">
                            This order has already been shipped or delivered. You cannot change the delivery address now.
                        </p>
                        <button
                            onClick={onClose}
                            className="mt-4 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg transition"
                        >
                            Close
                        </button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                            <p className="text-xs text-blue-600 font-medium">📦 Current Delivery Location</p>
                            <p className="text-sm font-medium mt-1">{address.city || address.street || address.name}</p>
                            <p className="text-xs text-slate-600">Use this location for delivery</p>
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <label className="block text-sm font-medium text-slate-700">Select New Address</label>
                                <button
                                    type="button"
                                    onClick={() => setShowNewAddressModal(true)}
                                    className="text-sm text-orange-500 hover:underline"
                                >
                                    + Add New
                                </button>
                            </div>
                            {isLoadingAddresses ? (
                                <div className="flex items:center justify-center py-4">
                                    <Loader size={20} className="animate-spin text-orange-500" />
                                </div>
                            ) : userAddresses.length > 0 ? (
                                <div className="space-y-2 max-h-48 overflow-y-auto">
                                    {userAddresses.map((addr) => (
                                        <label
                                            key={addr.id}
                                            className="flex items-start gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition"
                                        >
                                            <input
                                                type="radio"
                                                name="address"
                                                value={addr.id}
                                                checked={selectedAddressId === addr.id}
                                                onChange={(e) => setSelectedAddressId(e.target.value)}
                                                className="mt-1 accent-orange-500"
                                            />
                                                    <div className="flex-1 text-sm">
                                                        <p className="font-medium text-slate-700">{addr.city || addr.street || addr.name}</p>
                                                        <p className="text-xs text-slate-600">Delivery location</p>
                                                    </div>
                                        </label>
                                    ))}
                                </div>
                            ) : (
                                <div className="flex flex-col items-start gap-2">
                                    <p className="text-sm text-slate-500">No addresses found</p>
                                    <button
                                        type="button"
                                        onClick={() => setShowNewAddressModal(true)}
                                        className="text-sm text-orange-500 hover:underline"
                                    >
                                        Add Address
                                    </button>
                                </div>
                            )}
                        </div>

                        <div className="bg-gray-50 rounded-lg p-3 mt-4">
                                <p className="text-xs text-slate-600 font-medium mb-2">📍 New Address Preview</p>
                                <div className="text-xs space-y-1">
                                    <p><span className="font-medium">Delivery Location:</span> {displayAddress?.city || displayAddress?.street || displayAddress?.name || '—'}</p>
                                </div>
                            </div>
                        <div className="flex gap-2 pt-4 border-t border-gray-200">
                            <button
                                onClick={onClose}
                                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-slate-700 hover:bg-gray-50 transition font-medium"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleUpdateAddress}
                                disabled={loading || selectedAddressId === address.id}
                                className="flex-1 px-4 py-2 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white rounded-lg transition font-medium flex items-center justify-center gap-2"
                            >
                                {loading && <Loader size={16} className="animate-spin" />}
                                {loading ? 'Updating...' : 'Update Address'}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )

    return (
        <>
            {createPortal(modal, document.body)}
            {showNewAddressModal && (
                <AddressModal
                    setShowAddressModal={setShowNewAddressModal}
                    onSuccess={handleAddressAdded}
                />
            )}
        </>
    )
}

export default AddressEditModal
