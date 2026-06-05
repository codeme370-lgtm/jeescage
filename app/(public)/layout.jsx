'use client'

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useEffect, useState } from "react";
import { useDispatch,useSelector } from "react-redux";
import { fetchProducts } from "@/lib/features/product/productSlice";
import { fetchCategories } from "@/lib/features/category/categorySlice";
import { useAuth } from "@/context/AuthContext";
import { useSidebar } from "@/context/SidebarContext";
import { fetchCart,uploadCart } from "@/lib/features/cart/cartSlice";
import { fetchAddress } from "@/lib/features/address/addressSlice";
import { fetchUserRatings } from "@/lib/features/rating/ratingSlice";


export default function PublicLayout({ children }) {
const dispatch = useDispatch()
const [isMobile, setIsMobile] = useState(true)
//get the user and token
const { user, getToken } = useAuth()
//get cart items on load
const {cartItems} = useSelector((state) => state.cart);
const { sidebarOpen } = useSidebar()

useEffect(() => {
    const handleResize = () => {
        setIsMobile(window.innerWidth < 768)
    }
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
}, [])

    useEffect(()=>{
dispatch(fetchProducts({}))
dispatch(fetchCategories())
}, [])

 useEffect(()=>{
if(user){
        dispatch(fetchCart({getToken}))
        dispatch(fetchAddress({getToken}))
        dispatch(fetchUserRatings({getToken}))
}
}, [user])


useEffect(()=>{
if(user){
        dispatch(uploadCart({getToken}))
}
}, [cartItems])

    return (
        <>
            <Navbar />
            <div className={`transition-all duration-300 ${sidebarOpen ? 'md:pl-80' : 'md:pl-20'}`}>
                {children}
            </div>
            <Footer />
        </>
    );
}
