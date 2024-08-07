import { configureStore } from "@reduxjs/toolkit";
import { persistStore, persistReducer, createTransform } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import rootReducer, { RootState } from './Slices';
import { decryptData, encryptData } from "Utils/cryptoUtils";


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

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const Store = configureStore({
  reducer: persistedReducer,
});

export const persistor = persistStore(Store);

export type AppState = ReturnType<typeof Store.getState>;
export type AppDispatch = typeof Store.dispatch;


// export const Store = configureStore({
//     reducer: rememberReducer(rootReducer),
//     // devTools: true,
//     enhancers: (getDefaultEnhancers) => getDefaultEnhancers().concat(
//         rememberEnhancer(
//             window.localStorage, // or window.sessionStorage, or AsyncStorage, or your own custom storage driver
//             rememberedKeys
//         )
//     )
// });

// export type AppState = ReturnType<typeof Store.getState>;