import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage'; // defaults to localStorage for web
import { combineReducers } from 'redux';
import authReducer from './slices/authSlice';
import gameReducer from './slices/gameSlice';
import encryptTransform from './encryptTransform';

const rootReducer = combineReducers({
    auth: authReducer,
    game: gameReducer,
});

const persistConfig = {
    key: 'root',
    storage,
    transforms: [encryptTransform],
    whitelist: ['game'], // Only persist game data. Auth handled by Firebase, sessionConflictHandled by sessionStorage.
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
    reducer: persistedReducer,
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: false,
        }),
});

export const persistor = persistStore(store);
