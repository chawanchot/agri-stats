import { configureStore } from "@reduxjs/toolkit";
import cropSlice from "./slice/cropSlice";
import controlSlice from "./slice/controlSlice";

export const store = configureStore({
    reducer: {
        crop: cropSlice,
        control: controlSlice,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: false,
        }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
