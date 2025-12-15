import { createSlice,createAsyncThunk } from '@reduxjs/toolkit'

//setting a timer
let debounceTimer=null; 
//Upload cart items to the api
export const uploadCart = createAsyncThunk("cart/uploadCart",
    async ({ getToken, cartItems }, thunkAPI) => {
        try {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(async () => {
                const {cartItems}=thunkAPI.getState().cart;
                //generate token
                const token = await getToken()
                //upload cart to api
                await axios.post('/api/cart', { cartItems }, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                })
            },1000); //debounce time of 1 second
           
        } catch (error) {
            return thunkAPI.rejectWithValue(error.response.data)
        }
    }
)
//adding a fetch cart function
export const fetchCart = createAsyncThunk("cart/fetchCart",
    async ({getToken}, thunkAPI) => {
        try {
            const token = await getToken()
            //fetch cart from api
            const {data} = await axios.get('/api/cart', {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })
            return data
        } catch (error) {
            return thunkAPI.rejectWithValue(error.response.data)
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
            const { productId } = action.payload
            if (state.cartItems[productId]) {
                state.cartItems[productId]++
            } else {
                state.cartItems[productId] = 1
            }
            state.total += 1
        },
        removeFromCart: (state, action) => {
            const { productId } = action.payload
            if (state.cartItems[productId]) {
                state.cartItems[productId]--
                if (state.cartItems[productId] === 0) {
                    delete state.cartItems[productId]
                }
            }
            state.total -= 1
        },
        deleteItemFromCart: (state, action) => {
            const { productId } = action.payload
            state.total -= state.cartItems[productId] ? state.cartItems[productId] : 0
            delete state.cartItems[productId]
        },
        clearCart: (state) => {
            state.cartItems = {}
            state.total = 0
        },
    },
    //extra reducers for async thunks
    extraReducers: (builder) => {
        builder.addCase(fetchCart.fulfilled, (state, action) => {
            state.cartItems = action.payload.cartItems || {}
            state.total = Object.values(state.cartItems).reduce((acc, item) => acc + item, 0)
        });
    }
})

export const { addToCart, removeFromCart, clearCart, deleteItemFromCart } = cartSlice.actions

export default cartSlice.reducer
