import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    user: null,
    loading: true,
    sessionConflictHandled: false, // 세션 충돌 처리 여부
    error: null,
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        setUser: (state, action) => {
            state.user = action.payload;
            state.loading = false;
        },
        setLoading: (state, action) => {
            state.loading = action.payload;
        },
        setError: (state, action) => {
            state.error = action.payload;
            state.loading = false;
        },
        logout: (state) => {
            state.user = null;
            state.loading = false;
            state.sessionConflictHandled = false; // 로그아웃 시 초기화
            state.error = null;
        },
        setSessionConflictHandled: (state, action) => {
            state.sessionConflictHandled = action.payload;
        },
    },
});

export const { setUser, setLoading, setError, logout, setSessionConflictHandled } = authSlice.actions;
export default authSlice.reducer;
