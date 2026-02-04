import { useEffect, useRef } from "react";
import MainChartComponent from "@components/MainChartComponent";
import MainMap from "@components/Map/MainMap";
import { useAppDispatch } from "@store/hook";
import type { MapRef } from "react-map-gl/maplibre";
import { setCropYearList } from "@store/slice/cropSlice";
import MapControlComponent from "@components/MapControlComponent";
import ProvinceModalComponent from "@components/ProvinceModalComponent";

import cassavaData from "@assets/data/crops/cassava.json";
// import durianData from "@assets/data/crops/durian.json";
import longanData from "@assets/data/crops/longan.json";
import rubberData from "@assets/data/crops/rubber.json";
import maizeData from "@assets/data/crops/maize.json";
import palmData from "@assets/data/crops/palm.json";
const cropFiles = [cassavaData, longanData, rubberData, maizeData, palmData];

function HomePage() {
    const dispatch = useAppDispatch();

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
                        data: uniqueYears,
                    });
                }
            });

            dispatch(setCropYearList(allData));
        } catch (error) {
            console.log(error);
        }
    };

    useEffect(() => {
        fetchCropsList();
    }, []);

    return (
        <div className="flex items-center justify-center h-full relative">
            <MapControlComponent ref={mapRef} />
            <MainChartComponent />
            <MainMap ref={mapRef} />
            <ProvinceModalComponent ref={mapRef} />
        </div>
    );
}

export default HomePage;
