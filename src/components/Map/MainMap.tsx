import ProvinceLabelsLayer from "@components/Map/ProvinceLabelsLayer";
import ProvinceLayer from "@components/Map/ProvinceLayer";
import { useAppDispatch, useAppSelector } from "@store/hook";
import {
    setMainChartFilter,
    setProvince,
    setZoom,
} from "@store/slice/controlSlice";
import { forwardRef, useEffect, useState } from "react";
import Map, {
    LogoControl,
    Marker,
    NavigationControl,
    Popup,
    type MapRef,
    type MarkerEvent,
} from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";
import ProvincesData from "@assets/data/provinces.json";
import type { FeatureCollection } from "geojson";
import SoilSource from "@components/Map/SoilLayer";
import CropCompareLayer from "@components/Map/CropCompareLayer";
import { message, Tag } from "antd";
import Axios from "axios";
import type { LocationType, PopupStatusType } from "types";

const ProvincesGeoJson = ProvincesData as FeatureCollection;
const MAPTILER_KEY = import.meta.env.VITE_MAPTILER_KEY;
const GOOGLE_API_KEY = import.meta.env.VITE_GOOGLE_API_KEY;

const MainMap = forwardRef<MapRef>(({}, mapRef) => {
    const dispatch = useAppDispatch();
    const isModalOpen = useAppSelector((state) => state.control.modal);
    const zoom = useAppSelector((state) => state.control.zoom);
    const menuSelected = useAppSelector((state) => state.control.menu);
    const baseMap = useAppSelector((state) => state.control.baseMap);
    const [messageApi, contextHolder] = message.useMessage();

    const [hoverInfo, setHoverInfo] = useState<string | null>(null);
    const [hoverSoil, setHoverSoil] = useState<any>(null);
    const [hoverCompare, setHoverCompare] = useState<any>(null);
    const [soilData, setSoilData] = useState(null);
    const [locationData, setLocationData] = useState<LocationType[] | []>([]);
    const [popupStatus, setPopupStatus] = useState<any>(null);

    const onProvinceClick = async (event: any) => {
        const feature = event.features && event.features[0];

        if (
            feature &&
            feature.properties &&
            !isModalOpen &&
            mapRef &&
            typeof mapRef !== "function" &&
            mapRef.current
        ) {
            const { pro_th, pro_en, province_lat, province_lon } =
                feature.properties;

            mapRef.current?.flyTo({
                center: [province_lon, province_lat],
                zoom: 8,
                duration: 2000,
                offset: [-300, 0],
                essential: true,
            });

            try {
                const soilName = pro_en.replaceAll(" ", "").toLowerCase();
                const data = await import(`../../assets/data/soils/${soilName}.json`);

                setSoilData(data.default);
            } catch (error) {
                setSoilData(null);
            }

            dispatch(setProvince(pro_th));
        }
    };

    const onIdleHandle = () => {
        if (mapRef && typeof mapRef !== "function" && mapRef.current) {
            const features = mapRef.current.queryRenderedFeatures({
                layers: ["province-hover-fills"],
            });
            const provinces = features.map((item) => item.properties.pro_th);
            const uniqueProvinces = [...new Set(provinces)];

            dispatch(setMainChartFilter(uniqueProvinces));
        }
    };

    const fetchCropPrice = async () => {
        try {
            let allLocation: LocationType[] = [];
            let allPopup: PopupStatusType = {};

            const getPrice = await Axios.get(
                `http://localhost:5000/price-by-crop?crop=${menuSelected.crop}`
            );
            const priceData = getPrice.data.data;
            if (!priceData.length) {
                messageApi.open({
                    type: "warning",
                    content: `ไม่มีข้อมูลราคาสินค้า ${menuSelected.crop}`
                })

                return;
            }

            for (const item of priceData) {
                const location = encodeURIComponent(
                    `${item.market_name} ${item.province}`
                );
                const getLocation = await Axios.get(
                    `https://maps.googleapis.com/maps/api/geocode/json?address=${location}&key=${GOOGLE_API_KEY}`
                );

                const locationData = getLocation.data.results[0];

                const marketIndex = allLocation.findIndex((market) => market.name === item.market_name);
                if (marketIndex === -1) {
                    allLocation.push({
                        name: item.market_name,
                        province: item.province,
                        location: locationData.geometry.location,
                        productList: [
                            {
                                name: item.product_name,
                                price: item.day_price,
                                unit: item.unit,
                            }
                        ]
                    });
                } else {
                    allLocation[marketIndex].productList.push({
                        name: item.product_name,
                        price: item.day_price,
                        unit: item.unit,
                    })
                }
            }

            allLocation.map((item: LocationType) => {
                allPopup[item.name] = false;
            })

            console.log(allLocation);
            setPopupStatus(allPopup);
            setLocationData(allLocation);
        } catch (error) {
            console.log(error);
        }
    };

    const onClickMarker = (event: MarkerEvent<MouseEvent>, name: string) => {
        event.originalEvent.stopPropagation();
        let newStatus = {...popupStatus};

        Object.keys(newStatus).forEach((key) => {
            if (key === name) {
                newStatus[key] = !newStatus[key];
            } else {
                newStatus[key] = false;
            }
        })

        setPopupStatus(newStatus);
    }

    useEffect(() => {
        setLocationData([]);

        if (menuSelected.mode === "ราคา") {
            fetchCropPrice();
        }
    }, [menuSelected.crop, menuSelected.mode]);

    return (
        <>
            {contextHolder}
            <Map
                initialViewState={{
                    longitude: 100.9,
                    latitude: 13.18,
                    zoom: 5,
                }}
                mapStyle={`https://api.maptiler.com/maps/${baseMap}/style.json?key=${MAPTILER_KEY}`}
                ref={mapRef}
                maxBounds={[82.28, 4.77, 119.53, 21.32]}
                dragPan={!isModalOpen}
                scrollZoom={!isModalOpen}
                onZoom={(e) => dispatch(setZoom(e.viewState.zoom))}
                onClick={onProvinceClick}
                onIdle={onIdleHandle}
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
                {!isModalOpen && <NavigationControl position="bottom-left" />}

                <ProvinceLayer data={ProvincesGeoJson} hoverData={hoverInfo} />

                {zoom >= 8 && soilData && (
                    <SoilSource data={soilData} hoverData={hoverSoil} />
                )}

                {menuSelected.crop && menuSelected.mode === "ผลผลิต" && (
                    <CropCompareLayer
                        hoverData={hoverCompare}
                        type={menuSelected.type}
                    />
                )}

                <ProvinceLabelsLayer data={ProvincesGeoJson} />

                {menuSelected.mode === "ราคา" && locationData.map((item: LocationType) => {
                    return (
                        <div key={item.name}>
                            <Marker
                                latitude={item.location.lat}
                                longitude={item.location.lng}
                                onClick={(e) => onClickMarker(e, item.name)}
                                className="cursor-pointer"
                            >
                                <Tag
                                    variant="solid"
                                    color="white"
                                    className="text-black! shadow font-medium! rounded-full! text-xs! py-0.5!"
                                >
                                    {item.productList[0].price} ฿
                                </Tag>
                            </Marker>
                            {popupStatus && popupStatus[item.name] && (
                                <Popup
                                    latitude={item.location.lat}
                                    longitude={item.location.lng}
                                    closeButton={false}
                                    offset={15}
                                >
                                    <div className="flex flex-col items-center justify-center overflow-hidden">
                                        <div className="font-semibold">
                                            {item.name}
                                        </div>
                                        <div className="text-gray-500 -mt-1">{item.province}</div>
                                        <div className="flex flex-col mt-2">
                                            {item.productList.map((product, index) => (
                                                <div className="text-gray-800" key={index}>
                                                    {product.name}{" "}
                                                    <span className="font-semibold">
                                                        {product.price} {product.unit}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </Popup>
                            )}
                        </div>
                    );
                })}
            </Map>
        </>
    );
});

export default MainMap;
