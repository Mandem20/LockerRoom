import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  user: null
}

export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUserDetails : (state,action)=>{
     state.user = action.payload
    },
    LOGOUT_USER : (state) => {
        state.user = null
    }
  },
})

// Action creators are generated for each case reducer function
export const { setUserDetails, LOGOUT_USER } = userSlice.actions

export default userSlice.reducer