'use client'
import { useEffect, useState } from "react"
import Loading from "../Loading"
import Link from "next/link"
import { ArrowRightIcon } from "lucide-react"
import SellerNavbar from "./StoreNavbar"
import SellerSidebar from "./StoreSidebar"
import StoreDrawer from "./StoreDrawer"
import { useAuth } from "@/context/AuthContext"
import axios from "axios"



const StoreLayout = ({ children }) => {
    //check if the login user is a seller
    //get the token from authenticated user

    const { getToken } = useAuth()

    const [isSeller, setIsSeller] = useState(false)
    const [loading, setLoading] = useState(true)
    const [storeInfo, setStoreInfo] = useState(null)
    const [drawerOpen, setDrawerOpen] = useState(false)

    const fetchIsSeller = async () => {
       try {
        //get the token
        const token = await getToken()
        if(!token){
            // not authenticated
            setIsSeller(false)
            return
        }
        const {data}= await axios.get("/api/store/is-seller", {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
        setIsSeller(data.isSeller)
        setStoreInfo(data.storeInfo)
        
       } catch (error) {
        // treat 401 and 404 as not-a-seller (expected for non-sellers or missing route)
        const status = error?.response?.status
        if (status === 401 || status === 404) {
            setIsSeller(false)
        } else {
            // log server response body when available for easier debugging
            console.error('fetchIsSeller error', status, error?.response?.data || error?.message || error)
        }
       }finally {
        setLoading(false)
       }
    }

    useEffect(() => {
        fetchIsSeller()
    }, [])

    return loading ? (
        <Loading />
    ) : isSeller ? (
        <div className="flex flex-col h-screen">
            <SellerNavbar onMenuClick={() => setDrawerOpen(true)} />
            <StoreDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} storeInfo={storeInfo} />
            <div className="flex flex-1 items-start h-full overflow-y-scroll no-scrollbar">
                <SellerSidebar storeInfo={storeInfo} />
                <div className="flex-1 h-full p-5 lg:pl-12 lg:pt-12 overflow-y-scroll">
                    {children}
                </div>
            </div>
        </div>
    ) : (
        <div className="min-h-screen flex flex-col items-center justify-center text-center px-6">
            <h1 className="text-2xl sm:text-4xl font-semibold text-slate-400">You are not authorized to access this page</h1>
            <Link href="/" className="bg-slate-700 text-white flex items-center gap-2 mt-8 p-2 px-6 max-sm:text-sm rounded-full">
                Go to home <ArrowRightIcon size={18} />
            </Link>
        </div>
    )
}

export default StoreLayout