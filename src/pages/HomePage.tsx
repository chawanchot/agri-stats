import { useEffect, useRef } from "react";
import Axios from "axios";
import MainChartComponent from "@components/MainChartComponent";
import MainMap from "@components/Map/MainMap";
import { useAppDispatch, useAppSelector } from "@store/hook";
import type { MapRef } from "react-map-gl/maplibre";
import { setCropYearList } from '@store/slice/cropSlice';
import MapControlComponent from "@components/MapControlComponent";
import ProvinceModalComponent from "@components/ProvinceModalComponent";

function HomePage() {
    const dispatch = useAppDispatch();
    const provinceSelected = useAppSelector((state) => state.control.province);
    const zoom = useAppSelector((state) => state.control.zoom);

    const mapRef = useRef<MapRef>(null);

    const fetchCropsList = async () => {
        try {
            const getCropsList = await Axios.get("http://localhost:5000/crops-list");
            const cropsListData = getCropsList.data.data;

            dispatch(setCropYearList(cropsListData));
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

                <MapControlComponent ref={mapRef} />
                <MainChartComponent />
                <MainMap ref={mapRef} />

                <ProvinceModalComponent ref={mapRef} />
            </div>
        </div>
    );
}

export default HomePage;
