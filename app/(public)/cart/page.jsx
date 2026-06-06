'use client'
import Counter from "@/components/Counter";
import OrderSummary from "@/components/OrderSummary";
import PageTitle from "@/components/PageTitle";
import ProductCard from "@/components/ProductCard";
import { deleteItemFromCart } from "@/lib/features/cart/cartSlice";
import { Trash2Icon } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchProducts } from "@/lib/features/product/productSlice";

export default function Cart() {

    const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || 'GHS';
    
    const { cartItems } = useSelector(state => state.cart);
    const products = useSelector(state => state.product.list);

    const dispatch = useDispatch();

    const [cartArray, setCartArray] = useState([]);
    const [totalPrice, setTotalPrice] = useState(0);
    const [suggestedProducts, setSuggestedProducts] = useState([]);

    const createCartArray = () => {
        setTotalPrice(0);
        const cartArray = [];
        for (const [key, value] of Object.entries(cartItems)) {
            const cartItem = typeof value === 'number'
                ? { productId: key, quantity: value, selectedColor: null, cartKey: key }
                : { ...value, cartKey: key, quantity: value.quantity || 0, selectedColor: value.selectedColor || null };
            const product = products.find(product => product.id === cartItem.productId);
            if (product) {
                cartArray.push({
                    ...product,
                    quantity: cartItem.quantity,
                    selectedColor: cartItem.selectedColor,
                    cartKey: cartItem.cartKey,
                });
                setTotalPrice(prev => prev + product.price * cartItem.quantity);
            }
        }
        setCartArray(cartArray);
    }

    const handleDeleteItemFromCart = (cartKey) => {
        dispatch(deleteItemFromCart({ cartKey }))
    }

    useEffect(() => {
        if (products.length > 0) {
            createCartArray();
            setSuggestedProducts(products.slice(0, 20));
        }
    }, [cartItems, products]);

    useEffect(() => {
        dispatch(fetchProducts({}));
    }, [dispatch]);

    return (
        <div className="min-h-screen mx-6 text-slate-800">
            <div className="max-w-7xl mx-auto ">
                {/* Title */}
                <PageTitle heading="My Cart" text="items in your cart" linkText="Add more" />

                {cartArray.length > 0 ? (
                    <div className="flex items-start justify-between gap-5 max-lg:flex-col">
                        <table className="w-full max-w-4xl text-slate-600 table-auto">
                            <thead>
                                <tr className="max-sm:text-sm">
                                    <th className="text-left">Product</th>
                                    <th>Quantity</th>
                                    <th>Total Price</th>
                                    <th className="max-md:hidden">Remove</th>
                                </tr>
                            </thead>
                            <tbody>
                                {
                                    cartArray.map((item, index) => (
                                        <tr key={index} className="space-x-2">
                                            <td className="flex gap-3 my-4">
                                                <div className="flex gap-3 items-center justify-center bg-slate-100 size-18 rounded-md">
                                                    <Image src={item.images[0]} className="h-14 w-auto" alt={item?.name ? `${item.name} thumbnail` : 'Product thumbnail'} width={45} height={45} />
                                                </div>
                                                <div>
                                                    <p className="max-sm:text-sm">{item.name}</p>
                                                    <p className="text-xs text-slate-500">{item.category}</p>
                                                    {item.selectedColor && <p className="text-xs text-slate-500">Color: {item.selectedColor}</p>}
                                                    <p>{currency}{item.price}</p>
                                                </div>
                                            </td>
                                            <td className="text-center">
                                                <Counter cartKey={item.cartKey} productId={item.id} selectedColor={item.selectedColor} />
                                            </td>
                                            <td className="text-center">{currency}{(item.price * item.quantity).toLocaleString()}</td>
                                            <td className="text-center max-md:hidden">
                                                <button onClick={() => handleDeleteItemFromCart(item.cartKey)} className=" text-red-500 hover:bg-red-50 p-2.5 rounded-full active:scale-95 transition-all">
                                                    <Trash2Icon size={18} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                }
                            </tbody>
                        </table>
                        <OrderSummary totalPrice={totalPrice} items={cartArray} />
                    </div>
                ) : (
                    <div className="min-h-[40vh] flex items-center justify-center text-slate-400 mb-8">
                        <h1 className="text-2xl sm:text-4xl font-semibold">Your cart is empty</h1>
                    </div>
                )}

                {/* Suggested Products - always show */}
                {suggestedProducts.length > 0 && (
                    <div className="py-12">
                        <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-8">
                            <span className="text-red-600">Suggested</span> Products
                        </h2>
                        <div className="grid grid-cols-4 sm:grid-cols-4 md:grid-cols-4 lg:grid-cols-6 gap-4">
                            {suggestedProducts.map((product) => (
                                <ProductCard key={product.id} product={product} />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}