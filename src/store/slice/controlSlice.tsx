import { createSlice } from "@reduxjs/toolkit";

const BASE_MAP: Record<string, string> = {
    base: "019bbb54-0d1c-76fe-af75-43001c76bc8f",
    streets: "019bbb5a-b370-7ef2-967e-106e6fb5e3bf",
    satellite: "satellite",
};

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
        },
        mainChartFilter: [],
        baseMap: BASE_MAP.satellite,
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
            state.compare = { ...state.compare, ...action.payload };
        },
        setMainChartFilter: (state, action) => {
            state.mainChartFilter = action.payload;
        },
        setBaseMap: (state, action) => {
            state.baseMap = BASE_MAP[action.payload];
        }
    },
});

export const {
    openModal,
    closeModal,
    setProvince,
    setZoom,
    setCompareSelected,
    setMainChartFilter,
    setBaseMap
} = controlSlice.actions;
export default controlSlice.reducer;
