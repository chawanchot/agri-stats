import { createSlice } from "@reduxjs/toolkit";

export const cropSlice = createSlice({
    name: "crop",
    initialState: {
        cropByProvinceData: [],
        cropCompareData: {},
        cropMainChart: [],
        cropYearList: [],
    },
    reducers: {
        setCropByProvinceData: (state, action) => {
            state.cropByProvinceData = action.payload;
        },
        setCropCompareData: (state, action) => {
            state.cropCompareData = action.payload;
        },
        setCropMainChart: (state, action) => {
            state.cropMainChart = action.payload;
        },
        setCropYearList: (state, action) => {
            state.cropYearList = action.payload;
        }
    },
});

export const { setCropByProvinceData, setCropCompareData, setCropMainChart, setCropYearList } = cropSlice.actions;
export default cropSlice.reducer;
