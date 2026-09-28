import { PlusIcon, SquarePenIcon, XIcon } from 'lucide-react';
import React, { useState } from 'react'
import AddressModal from './AddressModal';
import { useDispatch,useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { useAuth } from "@/context/AuthContext";
import axios from 'axios';
import { fetchCart } from '@/lib/features/cart/cartSlice';
import { normalizePaymentMethod } from '@/lib/paymentProviders.mjs';
import { buildWhatsAppCheckoutMessage, createWhatsAppCheckoutLink, getBusinessWhatsAppNumber } from '@/lib/whatsappCheckout';

const OrderSummary = ({ totalPrice, items }) => {
    const {user}=useAuth();
    const {getToken}=useAuth();
    const dispatch = useDispatch();
    const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || 'GHS';

    const router = useRouter();

    const addressList = useSelector(state => state.address.list);
    const cartItems = useSelector(state => state.cart.cartItems || {});

    const [paymentMethod, setPaymentMethod] = useState('PAYSTACK');
    const [selectedAddress, setSelectedAddress] = useState(null);
    const [showAddressModal, setShowAddressModal] = useState(false);
    const [couponCodeInput, setCouponCodeInput] = useState('');
    const [coupon, setCoupon] = useState('');

    // compute delivery fee based on selected address and rules
    const computeDelivery = () => {
        if (!selectedAddress) return 0
        const city = (selectedAddress.city || '').toString().toLowerCase()
        if (city === 'kumasi') return 0
        if (totalPrice <= 500) return 20
        return parseFloat((totalPrice * 0.05).toFixed(2))
    }
    const deliveryAmount = computeDelivery()
    const couponDiscount = coupon ? (coupon.discount / 100 * totalPrice) : 0
    const displayedTotal = parseFloat((totalPrice + deliveryAmount - couponDiscount).toFixed(2))

    const handleCouponCode = async (event) => {
        event.preventDefault();
        //let's handle the API call
        try{
          //authenticate the user
          //when the user is not logged in
          if(!user){
            toast.error("You need to be logged in to apply a coupon")
            return;
          }
          //suppose the user is logged in
          const token = await getToken();
          const {data} = await axios.post('/api/coupon', {code: couponCodeInput}, {
            headers: {
              Authorization: `Bearer ${token}`
            }
          });
          setCoupon(data.coupon);
          toast.success("Coupon applied successfully")
        }catch(error){
            toast.error(error?.response?.data?.message || "Something went wrong while applying coupon")
        }
        
    }

    const buildWhatsAppOrderItems = () => {
        const orderItems = [];

        Object.values(cartItems || {}).forEach((cartEntry) => {
            const item = typeof cartEntry === 'number'
                ? { productId: null, quantity: cartEntry, selectedColor: null }
                : cartEntry;

            const product = items.find((entry) => {
                const productId = entry.id || entry.productId;
                return productId === item.productId;
            });

            orderItems.push({
                productName: product?.name || item.productName || 'Product',
                quantity: Number(item.quantity || 0) || 0,
                unitPrice: Number(product?.price ?? item.price ?? 0),
                variant: item.selectedColor || item.selectedVariant || item.selectedSize || item.variant || null,
            });
        });

        return orderItems.filter((item) => item.quantity > 0);
    };

    const handlePlaceOrder = async (e) => {
        e.preventDefault();

        const whatsappItems = buildWhatsAppOrderItems();

        if (!whatsappItems.length) {
            toast.error('Your cart is empty. Add products before checkout.');
            return;
        }

        const subtotal = Number(totalPrice || 0);
        const total = Number(displayedTotal || subtotal);
        const businessWhatsAppNumber = getBusinessWhatsAppNumber();
        const orderMessage = buildWhatsAppCheckoutMessage({
            items: whatsappItems,
            subtotal,
            total,
            currency,
        });
        const whatsappUrl = createWhatsAppCheckoutLink({
            number: businessWhatsAppNumber,
            message: orderMessage,
        });

        window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
        toast.success('Checkout started on WhatsApp. Review and send your order to confirm it.');
    };

    return (
        <div className='w-full max-w-lg lg:max-w-[340px] bg-slate-50/30 border border-slate-200 text-slate-500 text-sm rounded-xl p-7'>
            <h2 className='text-xl font-medium text-slate-600'>Payment Summary</h2>
            <p className='text-slate-400 text-xs my-4'>Payment Method</p>
            <div className='flex flex-col gap-3'>
                <label className='flex items-center gap-2 cursor-pointer'>
                    <input type="radio" id="PAYSTACK" name='payment' onChange={() => setPaymentMethod('PAYSTACK')} checked={paymentMethod === 'PAYSTACK'} className='accent-gray-500' />
                    <span>Paystack</span>
                </label>
                <label className='flex items-center gap-2 cursor-pointer'>
                    <input type="radio" id="HUBTEL" name='payment' onChange={() => setPaymentMethod('HUBTEL')} checked={paymentMethod === 'HUBTEL'} className='accent-gray-500' />
                    <span>Hubtel</span>
                </label>
            </div>
            <div className='my-4 py-4 border-y border-slate-200 text-slate-400'>
                <p>Address</p>
                {
                    selectedAddress ? (
                        <div className='flex gap-2 items-center'>
                            <p>{selectedAddress.city || selectedAddress.street || selectedAddress.name}</p>
                            <SquarePenIcon onClick={() => setSelectedAddress(null)} className='cursor-pointer' size={18} />
                        </div>
                    ) : (
                        <div>
                            {
                                addressList.length > 0 && (
                                    <select className='border border-slate-400 p-2 w-full my-3 outline-none rounded' onChange={(e) => setSelectedAddress(addressList[e.target.value])} >
                                        <option value="">Select Address</option>
                                        {
                                            addressList.map((address, index) => (
                                                <option key={index} value={index}>{address.city || address.street || address.name}</option>
                                            ))
                                        }
                                    </select>
                                )
                            }
                            <button className='flex items-center gap-1 text-slate-600 mt-1' onClick={() => setShowAddressModal(true)} >Add Address <PlusIcon size={18} /></button>
                        </div>
                    )
                }
            </div>
            <div className='pb-4 border-b border-slate-200'>
                <div className='flex justify-between'>
                    <div className='flex flex-col gap-1 text-slate-400'>
                        <p>Subtotal:</p>
                        <p>Delivery:</p>
                        {coupon && <p>Coupon:</p>}
                    </div>
                    <div className='flex flex-col gap-1 font-medium text-right'>
                        <p>{currency}{totalPrice.toLocaleString()}</p>
                        <p>{deliveryAmount === 0 ? 'Free' : `${currency}${deliveryAmount.toFixed(2)}`}</p>
                        {coupon && <p>{`-${currency}${couponDiscount.toFixed(2)}`}</p>}
                    </div>
                </div>
                {
                    !coupon ? (
                        <form onSubmit={e => toast.promise(handleCouponCode(e), { loading: 'Checking Coupon...' })} className='flex justify-center gap-3 mt-3'>
                            <input onChange={(e) => setCouponCodeInput(e.target.value)} value={couponCodeInput} type="text" placeholder='Coupon Code' className='border border-slate-400 p-1.5 rounded w-full outline-none' />
                            <button className='bg-slate-600 text-white px-3 rounded hover:bg-slate-800 active:scale-95 transition-all'>Apply</button>
                        </form>
                    ) : (
                        <div className='w-full flex items-center justify-center gap-2 text-xs mt-2'>
                            <p>Code: <span className='font-semibold ml-1'>{coupon.code.toUpperCase()}</span></p>
                            <p>{coupon.description}</p>
                            <XIcon size={18} onClick={() => setCoupon('')} className='hover:text-red-700 transition cursor-pointer' />
                        </div>
                    )
                }
            </div>
            <div className='flex justify-between py-4'>
                <p>Total:</p>
                <p className='font-medium text-right'>{currency}{displayedTotal.toFixed(2)}</p>
            </div>
            <button
                onClick={handlePlaceOrder}
                className='w-full bg-green-600 text-white py-3 rounded-lg font-semibold shadow-md hover:bg-green-700 active:scale-95 transition-all focus:outline-none focus:ring-4 focus:ring-green-200'
                aria-label="Checkout via WhatsApp"
            >
                Checkout via WhatsApp
            </button>
            <p className='mt-2 text-center text-xs text-slate-500'>Confirm your order on WhatsApp and arrange payment securely with the business.</p>

            {showAddressModal && <AddressModal setShowAddressModal={setShowAddressModal} />}

        </div>
    )
}

export default OrderSummary