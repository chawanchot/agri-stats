import cassavaData from "@assets/data/crops/cassava.json";
import longanData from "@assets/data/crops/longan.json";
import rubberData from "@assets/data/crops/rubber.json";
import maizeData from "@assets/data/crops/maize.json";
import palmData from "@assets/data/crops/palm.json";
import type { CropDetailType } from "types";
import ProvincesData from "../assets/data/provinces.json";
import type { FeatureCollection } from "geojson";
import { setCropCompareData, setCropMainChart } from "@store/slice/cropSlice";
import type { AppDispatch } from "@store/store";
import { setMenuSelected } from "@store/slice/controlSlice";

const ProvincesGeoJson = ProvincesData as FeatureCollection;
const cropFiles = [cassavaData, longanData, rubberData, maizeData, palmData];

export const fnFetchCropCompareData = async (crop: string, year: string, dispatch: AppDispatch) => {
    try {
        let cropData: CropDetailType[] = [];

        cropFiles.forEach((jsonData: any) => {
            const filtered = jsonData.filter((item: CropDetailType) => item.crop === crop && item.year === Number(year));

            if (filtered.length > 0) {
                cropData.push(...filtered);
            }
        });

        const updatedGeoJson = {
            ...ProvincesGeoJson,
            features: ProvincesGeoJson.features.map((feature: any) => {
                const match = cropData.find((item: CropDetailType) => item.province === feature.properties.pro_th);

                return {
                    ...feature,
                    properties: {
                        ...feature.properties,
                        yield_per_rai: match ? match.yield_per_rai : 0,
                        yield_ton: match ? match.yield_ton : 0,
                    },
                };
            }),
        };

        dispatch(setCropMainChart(cropData));
        dispatch(setCropCompareData(updatedGeoJson));
    } catch (error) {
        console.log(error);
    }
};

export const fnExitMainChart = (dispatch: AppDispatch) => {
    dispatch(setCropMainChart([]));
    dispatch(setCropCompareData([]));
    dispatch(setMenuSelected({ crop: "", mode: "", year: "" }));
};
