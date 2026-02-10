import ProvinceLabelsLayer from "@components/Map/ProvinceLabelsLayer";
import ProvinceLayer from "@components/Map/ProvinceLayer";
import { useAppDispatch, useAppSelector } from "@store/hook";
import { setMainChartFilter, setProvince, setZoom } from "@store/slice/controlSlice";
import { forwardRef, useEffect, useState } from "react";
import Map, { Marker, type MapRef, type MarkerEvent } from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";
import ProvincesData from "@assets/data/provinces.json";
import type { FeatureCollection } from "geojson";
import SoilLayer from "@components/Map/SoilLayer";
import CropCompareLayer from "@components/Map/CropCompareLayer";
import { message, Spin, Tag } from "antd";
import Axios from "axios";
import type { LocationType, PopupStatusType } from "types";
import { LoadingOutlined } from "@ant-design/icons";
import PricePopup from "@components/PricePopup";

const ProvincesGeoJson = ProvincesData as FeatureCollection;
const MAPTILER_KEY = import.meta.env.VITE_MAPTILER_KEY;
const GOOGLE_API_KEY = import.meta.env.VITE_GOOGLE_API_KEY;

type PropsType = {
    isLandingPage?: boolean;
};

const MainMap = forwardRef<MapRef, PropsType>(({ isLandingPage = false }, mapRef) => {
    const dispatch = useAppDispatch();
    const is_modal_open = useAppSelector((state) => state.control.modal);
    const zoom = useAppSelector((state) => state.control.zoom);
    const menu_selected = useAppSelector((state) => state.control.menu);
    const baseMap = useAppSelector((state) => state.control.baseMap);
    const [messageApi, contextHolder] = message.useMessage();

    const [hoverInfo, setHoverInfo] = useState<string | null>(null);
    const [hoverSoil, setHoverSoil] = useState<any>(null);
    const [hoverCompare, setHoverCompare] = useState<any>(null);
    const [soilData, setSoilData] = useState<FeatureCollection | null>(null);
    const [locationData, setLocationData] = useState<LocationType[] | []>([]);
    const [popupStatus, setPopupStatus] = useState<any>(null);
    const [price_loading, setPriceLoading] = useState<boolean>(false);

    const onProvinceClick = async (event: any) => {
        if (menu_selected.mode !== "ราคา") {
            const feature = event.features && event.features[0];

            if (feature && feature.properties && !is_modal_open && mapRef && typeof mapRef !== "function" && mapRef.current) {
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
                    const data = await import(`../../assets/data/soils/${soilName}.json`);
                    setSoilData(data.default);
                } catch (error) {
                    console.log(error);
                    setSoilData(null);
                }

                dispatch(setProvince(pro_th));
            }
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
            setPriceLoading(true);

            let allLocation: LocationType[] = [];
            let allPopup: PopupStatusType = {};

            const getPrice = await Axios.get(`https://mu2f.dev/price-by-crop?crop=${menu_selected.crop}`);
            const priceData = getPrice.data.data;
            if (!priceData.length) {
                messageApi.open({
                    type: "warning",
                    content: `ไม่มีข้อมูลราคาสินค้า ${menu_selected.crop}`,
                });

                return;
            }

            for (const item of priceData) {
                const location = encodeURIComponent(`${item.market_name} ${item.province}`);
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
                                data_date: item.data_date,
                            },
                        ],
                    });
                } else {
                    allLocation[marketIndex].productList.push({
                        name: item.product_name,
                        price: item.day_price,
                        unit: item.unit,
                        data_date: item.data_date,
                    });
                }
            }

            allLocation.map((item: LocationType, index: number) => {
                if (index === 0 && isLandingPage) {
                    allPopup[item.name] = true;
                } else {
                    allPopup[item.name] = false;
                }
            });

            setPopupStatus(allPopup);
            setLocationData(allLocation);
        } catch (error) {
            console.log(error);
        } finally {
            setPriceLoading(false);
        }
    };

    const onClickMarker = (event: MarkerEvent<MouseEvent>, name: string) => {
        event.originalEvent.stopPropagation();
        let newStatus = { ...popupStatus };

        Object.keys(newStatus).forEach((key) => {
            if (key === name) {
                newStatus[key] = !newStatus[key];
            } else {
                newStatus[key] = false;
            }
        });

        setPopupStatus(newStatus);
    };

    useEffect(() => {
        setLocationData([]);

        if (menu_selected.mode === "ราคา") {
            fetchCropPrice();
        }
    }, [menu_selected.crop, menu_selected.mode]);

    const applyLandingMode = (landing: boolean) => {
        if (mapRef && typeof mapRef !== "function" && mapRef.current) {
            const map = mapRef.current?.getMap();

            if (landing) {
                map.setMaxBounds(null);
            } else {
                mapRef.current?.flyTo({
                    center: [100.9, 13.18],
                    zoom: 4.8,
                    duration: 1000,
                    essential: true,
                });

                map.once("moveend", () => {
                    map.setProjection({ type: "mercator" });
                    map.setMaxBounds([82.28, 4.77, 119.53, 21.32]);
                });
            }
        }
    };

    return (
        <>
            {contextHolder}
            {price_loading && !isLandingPage && (
                <Spin size="large" indicator={<LoadingOutlined className="text-[#0f172a]!" spin />} fullscreen />
            )}
            <Map
                initialViewState={{
                    longitude: -100,
                    latitude: 40,
                    zoom: 1,
                }}
                mapStyle={`https://api.maptiler.com/maps/${baseMap}/style.json?key=${MAPTILER_KEY}`}
                ref={mapRef}
                dragPan={!is_modal_open}
                scrollZoom={!is_modal_open}
                onZoom={(e) => dispatch(setZoom(e.viewState.zoom))}
                onClick={onProvinceClick}
                onIdle={onIdleHandle}
                attributionControl={false}
                doubleClickZoom={false}
                onLoad={() => applyLandingMode(isLandingPage)}
                projection={{ type: "globe" }}
                onMouseMove={(e) => {
                    if (e.features && e.features.length > 0 && menu_selected.mode !== "ราคา") {
                        const provinceFeature = e.features.find((feature) => feature.layer?.id === "province-hover-fills");
                        const soilFeature = e.features.find((feature) => feature.layer?.id === "soil-fill");

                        const provinceCompareFeature = e.features.find(
                            (feature) => feature.layer?.id === "province-compare-fills"
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
                        } else {
                            setHoverSoil(null);
                        }

                        if (provinceCompareFeature) {
                            setHoverCompare({
                                lng: e.lngLat.lng,
                                lat: e.lngLat.lat,
                                properties: provinceCompareFeature.properties,
                            });
                        } else {
                            setHoverCompare(null);
                        }
                    } else {
                        setHoverSoil(null);
                        setHoverInfo(null);
                        setHoverCompare(null);
                    }
                }}
                interactiveLayerIds={["province-hover-fills", "soil-fill", "province-compare-fills"]}
            >
                <ProvinceLayer data={ProvincesGeoJson} hoverData={hoverInfo} />

                {zoom >= 8 && soilData && is_modal_open && <SoilLayer data={soilData} hoverData={hoverSoil} />}

                {menu_selected.crop && menu_selected.mode === "ผลผลิต" && (
                    <CropCompareLayer hoverData={hoverCompare} type={menu_selected.type} />
                )}

                <ProvinceLabelsLayer data={ProvincesGeoJson} />

                {menu_selected.mode === "ราคา" &&
                    locationData.map((item: LocationType) => {
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
                                        className={`text-black! font-semibold! text-sm rounded-md! px-2! py-0.5! drop-shadow-sm ${popupStatus[item.name] ? "bg-[#2D6A4F]! text-white!" : "bg-white! text-black!"}`}
                                    >
                                        {item.productList[0].price} ฿
                                    </Tag>
                                </Marker>
                                {popupStatus && popupStatus[item.name] && <PricePopup data={item} />}
                            </div>
                        );
                    })}
            </Map>
        </>
    );
});

export default MainMap;
