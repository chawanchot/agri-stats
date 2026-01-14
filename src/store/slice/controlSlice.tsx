import { createSlice } from "@reduxjs/toolkit";

export const controlSlice = createSlice({
    name: "control",
    initialState: {
        modal: false,
        province: "",
        zoom: 5,
        compare: {
            crop: "",
            year: "",
            type: "ผลผลิตต่อไร่",
        }
    },
    reducers: {
        openModal: (state) => {
            state.modal = true;
        },
        closeModal: (state) => {
            state.modal = false;
        },
        setProvince: (state, action) => {
            state.province = action.payload;
        },
        setZoom: (state, action) => {
            state.zoom = action.payload;
        },
        setCompareSelected: (state, action) => {
            state.compare = {...state.compare, ...action.payload};
        }
    },
});

export const { openModal, closeModal, setProvince, setZoom, setCompareSelected } = controlSlice.actions;
export default controlSlice.reducer;
