import { useEffect, useRef } from "react";
import MainChartComponent from "@components/MainChartComponent";
import MainMap from "@components/Map/MainMap";
import { useAppDispatch, useAppSelector } from "@store/hook";
import type { MapRef } from "react-map-gl/maplibre";
import { setCropYearList } from '@store/slice/cropSlice';
import MapControlComponent from "@components/MapControlComponent";
import ProvinceModalComponent from "@components/ProvinceModalComponent";

import cassavaData from "@assets/data/crops/cassava.json";
import durianData from "@assets/data/crops/durian.json";
import longanData from "@assets/data/crops/longan.json";
import rubberData from "@assets/data/crops/rubber.json";
const cropFiles = [cassavaData, durianData, longanData, rubberData];

function HomePage() {
    const dispatch = useAppDispatch();
    const provinceSelected = useAppSelector((state) => state.control.province);
    const zoom = useAppSelector((state) => state.control.zoom);

    const mapRef = useRef<MapRef>(null);

    const fetchCropsList = async () => {
        try {
            const allData: { name: string; data: number[] }[] = [];

            cropFiles.forEach((jsonData) => {
                if (jsonData.length > 0) {
                    const cropName = jsonData[0].crop;
                    const years = jsonData.map((item) => item.year);
                    const uniqueYears = [...new Set(years)];

                    allData.push({
                        name: cropName,
                        data: uniqueYears
                    });
                }
            });

            dispatch(setCropYearList(allData));
        } catch (error) {
            console.log(error);
        }
    }

    useEffect(() => {
        fetchCropsList();
    }, [])

    return (
        <div className="flex items-center justify-center h-full">
            <div className="w-full h-full">
                {zoom >= 8 && provinceSelected && (
                    <div className="pointer-events-none absolute bottom-5 left-5 z-10 text-9xl text-white text-sh text-shadow-lg">
                        {provinceSelected}
                    </div>
                )}

                <MapControlComponent />
                <MainChartComponent />
                <MainMap ref={mapRef} />

                <ProvinceModalComponent ref={mapRef} />
            </div>
        </div>
    );
}

export default HomePage;
