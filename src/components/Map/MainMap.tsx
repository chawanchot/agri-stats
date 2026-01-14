import ProvinceLabelsLayer from "@components/Map/ProvinceLabelsLayer";
import ProvinceLayer from "@components/Map/ProvinceLayer";
import { useAppDispatch, useAppSelector } from "@store/hook";
import { openModal, setProvince, setZoom } from "@store/slice/controlSlice";
import { forwardRef, useState } from "react";
import Map, { LogoControl, type MapRef } from "react-map-gl/maplibre";
import 'maplibre-gl/dist/maplibre-gl.css';
import ProvincesData from "@data/provinces.json";
import type { FeatureCollection } from "geojson";
import SoilSource from "@components/Map/SoilLayer";
import CropCompareLayer from "@components/Map/CropCompareLayer";

const ProvincesGeoJson = ProvincesData as FeatureCollection;

const MainMap = forwardRef<MapRef>(({}, mapRef) => {
    const dispatch = useAppDispatch();
    const isModalOpen = useAppSelector((state) => state.control.modal);
    const zoom = useAppSelector((state) => state.control.zoom);
    const compareSelected = useAppSelector((state) => state.control.compare);

    const [hoverInfo, setHoverInfo] = useState<string | null>(null);
    const [hoverSoil, setHoverSoil] = useState<any>(null);
    const [hoverCompare, setHoverCompare] = useState<any>(null);
    const [soilData, setSoilData] = useState(null);

    const onProvinceClick = async (event: any) => {
        const feature = event.features && event.features[0];

        if (feature && feature.properties && !isModalOpen && mapRef && typeof mapRef !== 'function' && mapRef.current) {
            const { pro_th, pro_en, province_lat, province_lon } = feature.properties;

            mapRef.current?.flyTo({
                center: [province_lon, province_lat],
                zoom: 8,
                duration: 2000,
                offset: [-300, 0],
                essential: true,
            });

            try {
                const soilName = pro_en.replaceAll(" ", "").toLowerCase();
                const data = await import(`../../data/soils/${soilName}.json`);

                setSoilData(data.default);
            } catch (error) {
                setSoilData(null);
            }

            dispatch(setProvince(pro_th))

            setTimeout(() => {
                dispatch(openModal());
            }, 2000);
        }
    };

    return (
        <Map
            initialViewState={{
                longitude: 100.9,
                latitude: 13.18,
                zoom: 5,
            }}
            mapStyle="https://api.maptiler.com/maps/satellite/style.json?key=tyvX9K3LBlgWHkvFYjfl"
            ref={mapRef}
            maxBounds={[82.28, 4.77, 119.53, 21.32]}
            dragPan={!isModalOpen}
            scrollZoom={!isModalOpen}
            onZoom={(e) => dispatch(setZoom(e.viewState.zoom))}
            onClick={onProvinceClick}
            onMouseMove={(e) => {
                if (e.features && e.features.length > 0) {
                    const provinceFeature = e.features.find(
                        (feature) =>
                            feature.layer?.id === "province-hover-fills"
                    );
                    const soilFeature = e.features.find(
                        (feature) => feature.layer?.id === "soil-fill"
                    );

                    const provinceCompareFeature = e.features.find(
                        (feature) =>
                            feature.layer?.id === "province-compare-fills"
                    );

                    if (provinceFeature) {
                        setHoverInfo(provinceFeature.properties?.pro_th);
                    } else {
                        setHoverInfo(null);
                    }

                    if (soilFeature) {
                        setHoverSoil({
                            longitude: e.lngLat.lng,
                            latitude: e.lngLat.lat,
                            properties: soilFeature.properties,
                        });
                    }

                    if (provinceCompareFeature) {
                        setHoverCompare({
                            lng: e.lngLat.lng,
                            lat: e.lngLat.lat,
                            properties: provinceCompareFeature.properties,
                        });
                    }
                } else {
                    setHoverSoil(null);
                    setHoverInfo(null);
                    setHoverCompare(null);
                }
            }}
            interactiveLayerIds={[
                "province-hover-fills",
                "soil-fill",
                "province-compare-fills",
            ]}
        >
            <LogoControl />
            <ProvinceLayer data={ProvincesGeoJson} hoverData={hoverInfo} />

            {zoom >= 8 && soilData && (
                <SoilSource data={soilData} hoverData={hoverSoil} />
            )}

            {compareSelected.crop && (
                <CropCompareLayer
                    hoverData={hoverCompare}
                    type={compareSelected.type}
                />
            )}

            <ProvinceLabelsLayer data={ProvincesGeoJson} />
        </Map>
    );
})

export default MainMap;
