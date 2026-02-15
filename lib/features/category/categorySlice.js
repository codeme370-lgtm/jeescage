import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios'

export const fetchCategories = createAsyncThunk('category/fetchCategories', async (_, thunkAPI) => {
  try {
    const { data } = await axios.get('/api/store/category')
    return data.categories || []
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data || error.message)
  }
})

export const createCategory = createAsyncThunk('category/createCategory', async ({ name, token }, thunkAPI) => {
  try {
    const { data } = await axios.post('/api/store/category', { name }, {
      headers: { Authorization: `Bearer ${token}` }
    })
    return data.category
  } catch (error) {
    // If already exists, try to return the existing name
    const msg = error.response?.data?.error || error.message
    // try to read categories from state and find matching
    const state = thunkAPI.getState()
    const existing = state?.category?.list?.find(c => c.name.toLowerCase() === name.toLowerCase())
    if (existing) return existing
    return thunkAPI.rejectWithValue(msg)
  }
})

const categorySlice = createSlice({
  name: 'category',
  initialState: {
    list: [],
    status: 'idle',
    error: null
  },
  reducers: {
    addLocalCategory(state, action) {
      const name = action.payload
      if (!state.list.find(c => c.name.toLowerCase() === name.toLowerCase())) {
        state.list.unshift({ name, slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') })
      }
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCategories.pending, (state) => { state.status = 'loading' })
      .addCase(fetchCategories.fulfilled, (state, action) => { state.status = 'succeeded'; state.list = action.payload })
      .addCase(fetchCategories.rejected, (state, action) => { state.status = 'failed'; state.error = action.payload })
      .addCase(createCategory.fulfilled, (state, action) => {
        const cat = action.payload
        if (cat && !state.list.find(c => c.name.toLowerCase() === cat.name.toLowerCase())) {
          state.list.unshift(cat)
        }
      })
      .addCase(createCategory.rejected, (state, action) => { state.error = action.payload })
  }
})

export const { addLocalCategory } = categorySlice.actions
export default categorySlice.reducer
