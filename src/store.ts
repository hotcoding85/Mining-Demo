import { configureStore } from "@reduxjs/toolkit";
import { persistStore, persistReducer, createTransform } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import rootReducer, { RootReducer } from './slices';
import { decryptData, encryptData } from "utils/cryptoUtils";

// Define the encryption transform
const encryptionTransform = createTransform(
  (inboundState: any, key) => {
    // Encrypt the state before storing
    return encryptData(inboundState);
  },
  (outboundState, key) => {
    // Decrypt the state before rehydrating
    return decryptData(outboundState);
  },
  { whitelist: ['Auth'] }
);

const persistConfig = {
  key: 'state',
  storage,
  // whitelist: ['Auth'],
  transforms: [encryptionTransform],
};

const persistedReducer = persistReducer<RootReducer>(persistConfig, rootReducer);

export const Store = configureStore({
  reducer: persistedReducer,
});

export const persistor = persistStore(Store);

export type AppState = ReturnType<typeof Store.getState>;
export type AppDispatch = typeof Store.dispatch;