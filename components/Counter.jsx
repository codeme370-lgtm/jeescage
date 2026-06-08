'use client'
import { addToCart, removeFromCart, getCartKey } from "@/lib/features/cart/cartSlice";
import { useDispatch, useSelector } from "react-redux";
import { useAuth } from "@/context/AuthContext"
import toast from 'react-hot-toast'

const Counter = ({ cartKey, productId, selectedColor = null }) => {

    const { cartItems } = useSelector(state => state.cart);

    const dispatch = useDispatch();
    const { user, isLoaded } = useAuth()

    const key = cartKey || getCartKey(productId, selectedColor)
    const quantity = cartItems[key] ? (typeof cartItems[key] === 'number' ? cartItems[key] : cartItems[key].quantity) : 1

    const addToCartHandler = () => {
        if (!isLoaded || !user) {
            toast.error('Please sign in to add items to your cart')
            return
        }
        dispatch(addToCart({ productId, selectedColor }))
    }

    const removeFromCartHandler = () => {
        dispatch(removeFromCart({ productId, selectedColor }))
    }

    return (
        <div className="inline-flex items-center gap-1 sm:gap-3 px-3 py-1 rounded border border-slate-200 max-sm:text-sm text-slate-600">
            <button
                onClick={removeFromCartHandler}
                disabled={quantity <= 0}
                className={`p-1 select-none ${quantity <= 0 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-slate-100 rounded'}`}
            >-</button>
            <p className="p-1">{quantity}</p>
            <button onClick={addToCartHandler} className="p-1 select-none hover:bg-slate-100 rounded">+</button>
        </div>
    )
}

export default Counter