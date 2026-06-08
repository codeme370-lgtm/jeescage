import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios'

const getCartKey = (productId, selectedColor = null) => {
    const colorKey = selectedColor ? selectedColor.toString() : 'default'
    return `${productId}|${colorKey}`
}

const normalizeStoredCartItems = (storedCart) => {
    if (!storedCart || typeof storedCart !== 'object') return {}

    const normalized = {}
    for (const [key, value] of Object.entries(storedCart)) {
        if (typeof value === 'number') {
            normalized[getCartKey(key, null)] = {
                productId: key,
                quantity: value,
                selectedColor: null,
            }
        } else if (value && typeof value === 'object') {
            const itemKey = value.cartKey || getCartKey(value.productId, value.selectedColor)
            normalized[itemKey] = {
                productId: value.productId,
                quantity: value.quantity || 0,
                selectedColor: value.selectedColor || null,
            }
        }
    }
    return normalized
}

//setting a timer
let debounceTimer = null;
//Upload cart items to the api
export const uploadCart = createAsyncThunk("cart/uploadCart",
    async ({ getToken }, thunkAPI) => {
        try {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(async () => {
                try {
                    const { cartItems } = thunkAPI.getState().cart;
                    const token = await getToken()
                    await axios.post('/api/cart', { cartItems }, {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    })
                } catch (error) {
                    console.error('Upload cart error:', error.response?.data || error.message)
                    thunkAPI.rejectWithValue(error.response?.data || error.message)
                }
            }, 1000); //debounce time of 1 second
        } catch (error) {
            return thunkAPI.rejectWithValue(error.response?.data || error.message)
        }
    }
)

//adding a fetch cart function
export const fetchCart = createAsyncThunk("cart/fetchCart",
    async ({ getToken }, thunkAPI) => {
        try {
            const token = await getToken()
            const { data } = await axios.get('/api/cart', {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })
            return data
        } catch (error) {
            return thunkAPI.rejectWithValue(error.response?.data)
        }
    }
)

const cartSlice = createSlice({
    name: 'cart',
    initialState: {
        total: 0,
        cartItems: {},
    },
    reducers: {
        addToCart: (state, action) => {
            const { productId, selectedColor = null } = action.payload
            const cartKey = getCartKey(productId, selectedColor)
            if (state.cartItems[cartKey]) {
                state.cartItems[cartKey].quantity += 1
            } else {
                state.cartItems[cartKey] = {
                    productId,
                    quantity: 1,
                    selectedColor: selectedColor || null,
                }
            }
            state.total += 1
        },
        removeFromCart: (state, action) => {
            const { productId, selectedColor = null } = action.payload
            const cartKey = getCartKey(productId, selectedColor)
            const item = state.cartItems[cartKey]
            if (item) {
                item.quantity -= 1
                if (item.quantity <= 0) {
                    delete state.cartItems[cartKey]
                }
                state.total -= 1
            }
        },
        deleteItemFromCart: (state, action) => {
            const { cartKey, productId, selectedColor = null } = action.payload
            const key = cartKey || getCartKey(productId, selectedColor)
            const item = state.cartItems[key]
            if (item) {
                state.total -= item.quantity
                delete state.cartItems[key]
            }
        },
        clearCart: (state) => {
            state.cartItems = {}
            state.total = 0
        },
    },
    //extra reducers for async thunks
    extraReducers: (builder) => {
        builder.addCase(fetchCart.fulfilled, (state, action) => {
            state.cartItems = normalizeStoredCartItems(action.payload.cart || action.payload.cartItems || {})
            state.total = Object.values(state.cartItems).reduce((acc, item) => acc + item.quantity, 0)
        });
    }
})

export const { addToCart, removeFromCart, clearCart, deleteItemFromCart } = cartSlice.actions
export { getCartKey }

export default cartSlice.reducer
