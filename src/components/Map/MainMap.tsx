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
import type { LocationType, PopupStatusType, PriceType } from "types";
import { LoadingOutlined } from "@ant-design/icons";
import PricePopup from "@components/PricePopup";
import priceMockData from "@assets/data/price.json";

const ProvincesGeoJson = ProvincesData as FeatureCollection;
const MAPTILER_KEY = import.meta.env.VITE_MAPTILER_KEY;

const MainMap = forwardRef<MapRef>((_, mapRef) => {
    const dispatch = useAppDispatch();
    const is_modal_open = useAppSelector((state) => state.control.modal);
    const zoom = useAppSelector((state) => state.control.zoom);
    const menu_selected = useAppSelector((state) => state.control.menu);
    const base_map = useAppSelector((state) => state.control.baseMap);
    const is_landing = useAppSelector((state) => state.control.isLanding);
    const [messageApi, contextHolder] = message.useMessage();

    const [hoverInfo, setHoverInfo] = useState<string | null>(null);
    const [hoverSoil, setHoverSoil] = useState<any>(null);
    const [hoverCompare, setHoverCompare] = useState<any>(null);
    const [soilData, setSoilData] = useState<FeatureCollection | null>(null);
    const [locationData, setLocationData] = useState<LocationType[] | []>([]);
    const [popup_status, setPopupStatus] = useState<Record<string, boolean> | null>(null);
    const [price_loading, setPriceLoading] = useState<boolean>(false);

    // เช็คว่าเป็น mobile สำหรับ zoom และ duration แผนที่ตอนเลือกจังหวัด
    const fnIsMobile = () => window.matchMedia("(max-width: 768px)").matches;

    // ซูมแผนที่แล้วโหลดข้อมูลดินตอนคลิกเลือกจังหวัด
    const onProvinceClick = async (event: any) => {
        if (menu_selected.mode !== "ราคา" && menu_selected.mode !== "ผลผลิต") {
            const feature = event.features && event.features[0];

            if (feature && feature.properties && !is_modal_open && mapRef && typeof mapRef !== "function" && mapRef.current) {
                const { pro_th, pro_en, province_lat, province_lon } = feature.properties;

                mapRef.current?.flyTo({
                    center: [province_lon, province_lat],
                    zoom: fnIsMobile() ? 7 : 8,
                    duration: 2000,
                    offset: fnIsMobile() ? [0, -150] : [-300, 0],
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

    // filter จังหวัดที่จะแสดงบนกราฟตอนแผนที่หยุดขยับ
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

    const normalize = (str: string) => {
        return str
            .normalize("NFKC") // แก้ unicode
            .replace(/\s+/g, "") // ลบ whitespace ทุกชนิด
            .trim();
    };

    // ดึงข้อมูลราคาสินค้าและ location
    const fetchCropPrice = async () => {
        try {
            setPriceLoading(true);

            const mockData = priceMockData.data as PriceType[];
            let allLocation: LocationType[] = [];
            let allPopup: PopupStatusType = {};

            const priceData = mockData.filter((mock) => mock.product_category === menu_selected.crop);

            // const getPrice = await Axios.get(`https://agri-stats-api.mu2f.dev/price-by-crop?crop=${menu_selected.crop}`);
            // const priceData = getPrice.data.data;
            if (!priceData.length) {
                messageApi.open({
                    type: "warning",
                    content: `ไม่มีข้อมูลราคาสินค้า ${menu_selected.crop}`,
                });

                return;
            }

            for (const item of priceData) {
                const location = encodeURIComponent(`${item.market_name} ${item.province}`);
                const getLocation = await Axios.get(`https://agri-stats-api.mu2f.dev/geocode?address=${location}`);

                const locationData = getLocation.data.results?.[0];
                if (!locationData?.geometry?.location) {
                    continue;
                }

                const marketIndex = allLocation.findIndex((market) => {
                    return normalize(market.name) === normalize(item.market_name);
                });

                if (marketIndex === -1) {
                    allLocation.push({
                        name: item.market_name,
                        province: item.province,
                        location: locationData.geometry.location,
                        productList: [
                            {
                                name: item.product_name,
                                price: typeof item.day_price === "string" ? parseFloat(item.day_price) : item.day_price,
                                unit: item.unit,
                                data_date: item.data_date,
                            },
                        ],
                    });
                } else {
                    allLocation[marketIndex].productList.push({
                        name: item.product_name,
                        price: typeof item.day_price === "string" ? parseFloat(item.day_price) : item.day_price,
                        unit: item.unit,
                        data_date: item.data_date,
                    });
                }
            }

            console.log(allLocation);

            allLocation.map((item: LocationType, index: number) => {
                // Zoom เข้าจุดรับซื้อและโชว์ Popup เมื่ออยู่หน้า LandingPage
                if (index === 0 && is_landing && mapRef && typeof mapRef !== "function" && mapRef.current) {
                    allPopup[item.name] = true;
                    mapRef.current?.flyTo({
                        center: [item.location.lng, item.location.lat],
                        zoom: 8,
                        duration: 1500,
                        essential: true,
                    });
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

    // เปิด/ปิด Popup ราคาสินค้าตอนคลิก Marker บนแผนที่
    const onClickMarker = (event: MarkerEvent<MouseEvent>, name: string) => {
        event.originalEvent.stopPropagation();
        let newStatus = { ...popup_status };

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
            {price_loading && !is_landing && (
                <Spin size="large" indicator={<LoadingOutlined className="text-[#0f172a]!" spin />} fullscreen />
            )}
            <Map
                initialViewState={{
                    longitude: -100,
                    latitude: 40,
                    zoom: 1,
                }}
                mapStyle={`https://api.maptiler.com/maps/${base_map}/style.json?key=${MAPTILER_KEY}`}
                ref={mapRef}
                dragPan={!is_modal_open}
                scrollZoom={!is_modal_open}
                onZoom={(e) => dispatch(setZoom(e.viewState.zoom))}
                onClick={onProvinceClick}
                onIdle={onIdleHandle}
                attributionControl={false}
                doubleClickZoom={false}
                onLoad={() => applyLandingMode(is_landing)}
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

                {zoom >= 7 && soilData && is_modal_open && <SoilLayer data={soilData} hoverData={hoverSoil} />}

                {menu_selected.crop && menu_selected.mode === "ผลผลิต" && (
                    <CropCompareLayer hoverData={hoverCompare} type={menu_selected.type} />
                )}

                <ProvinceLabelsLayer data={ProvincesGeoJson} />

                {menu_selected.mode === "ราคา" &&
                    locationData.map((item: LocationType, index: number) => {
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
                                        className={`text-black! font-semibold! text-sm rounded-md! px-2! py-0.5! drop-shadow-sm ${popup_status?.[item.name] ? "bg-[#2D6A4F]! text-white!" : "bg-white! text-black!"}`}
                                    >
                                        {item.productList[0].price} ฿
                                    </Tag>
                                </Marker>
                                {popup_status && popup_status[item.name] && <PricePopup key={index} data={item} />}
                            </div>
                        );
                    })}
            </Map>
        </>
    );
});

export default MainMap;
