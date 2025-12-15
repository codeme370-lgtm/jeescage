import { createAsyncThunk,createSlice } from '@reduxjs/toolkit'


//fetch the user ratings
export const fetchUserRatings= createAsyncThunk('rating/fetchUserRatings', 
    async ({getToken}, thunkAPI) => {
    try{
        const token = await getToken();
        const {data} = await axios.get('/api/rating', {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        return data ? data.ratings: [];
    }catch(error){
        return thunkAPI.rejectWithValue(error?.response?.data?.error || "Something went wrong while fetching ratings");
    }
})


const ratingSlice = createSlice({
    name: 'rating',
    initialState: {
        ratings: [],
    },
    reducers: {
        addRating: (state, action) => {
            state.ratings.push(action.payload)
        },
    },
    //extra reducers for fetchUserRatings
    extraReducers: (builder) => {
        builder.addCase(fetchUserRatings.fulfilled, (state, action) => {
            state.ratings = action.payload;
        })
    }
})

export const { addRating } = ratingSlice.actions

export default ratingSlice.reducer