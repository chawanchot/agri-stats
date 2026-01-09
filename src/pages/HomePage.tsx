import Map, { type MapRef } from "react-map-gl/mapbox";
import "mapbox-gl/dist/mapbox-gl.css";
import ProvincesData from "../data/provinces.json";
import type { FeatureCollection } from "geojson";
import { useEffect, useRef, useState } from "react";
import Axios from "axios";
import { Button, Cascader, Modal, Segmented, Tag, Tree, type CascaderProps } from "antd";
import CropCompareSource from "@components/CropCompareSource";
import SoilSource from "@components/SoilSource";
import ProvinceSource from "@components/ProvinceSource";
import ProvinceLabelsSource from "@components/ProvinceLabelsSource";
import ChartComponent from "@components/ChartComponent";

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;
const ProvincesGeoJson = ProvincesData as FeatureCollection;

type CropType = {
    name: string;
    data: CropDetailType[]
}

type CropDetailType = {
    crop: string;
    harvest_area: number;
    planted_area: number;
    province: string;
    year: number;
    yield_per_rai: number;
    yield_ton: number;
};

type PriceType = {
    day_price: string;
    product_category: string;
    product_name: string;
    unit: string;
}

type Option = {
    value: string;
    label: string;
    children?: Option[];
};

function HomePage() {
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [hoverInfo, setHoverInfo] = useState<string | null>(null);
    const [provinceSelected, setProvinceSelected] = useState<string | null>(null);
    const [cropProvinceData, setCropProvinceData] = useState<CropType[] | []>([]);
    const [soilData, setSoilData] = useState(null);
    const [hoverSoil, setHoverSoil] = useState<any>(null);
    const [hoverCompare, setHoverCompare] = useState<any>(null);
    const [cropCompareSelected, setCropCompareSelected] = useState<string[] | undefined>(undefined);
    const [cropCompareData, setCropCompareData] = useState<FeatureCollection>(ProvincesGeoJson);
    const [cropCompareType, setCropCompareType] = useState<string>("ผลผลิตต่อไร่");
    const [provinceCropsData, setProvinceCropsData] = useState<any>([]);
    const [cropCompareOptions, setCropCompareOptions] = useState<Option[] | []>([]);
    const [zoom, setZoom] = useState(5);

    const mapRef = useRef<MapRef>(null);

    const onProvinceClick = async (event: any) => {
        const feature = event.features && event.features[0];

        if (feature && feature.properties && !isModalOpen) {
            const { pro_th, pro_en, province_lat, province_lon } = feature.properties;

            mapRef.current?.flyTo({
                center: [province_lon, province_lat],
                zoom: 8,
                duration: 2000,
                offset: [-250, 0],
                essential: true,
            });

            try {
                const soilName = pro_en.replaceAll(" ", "").toLowerCase();
                const data = await import(`../data/soils/${soilName}.json`);

                setSoilData(data.default);
            } catch (error) {
                setSoilData(null);
            }

            try {
                const getCropsByProvince = await Axios.get(`http://localhost:5000/crops-by-province?province=${pro_th}`);
                const cropsData = getCropsByProvince.data.data;
                setCropProvinceData(cropsData);
                fetchCropPrice(cropsData);

                setTimeout(() => {
                    setIsModalOpen(true);
                    setProvinceSelected(pro_th);
                }, 2000);
            } catch (error) {
                console.log(error);
            }
        }
    };

    const exitProvince = () => {
        setIsModalOpen(false);
        setProvinceSelected(null);

        mapRef.current?.flyTo({
            center: [100.5, 13.7],
            zoom: 5,
            duration: 2000,
            essential: true,
        });
    };

    const onCropsSelectedChange: CascaderProps<Option>["onChange"] = (value) => {
        setCropCompareSelected(value);

        if (value) {
            fetchCropCompareData(value[0], value[1]);
        }
    };

    const fetchCropCompareData = async (crop: string, year: string) => {
        try {
            const getCropData = await Axios.get(`http://localhost:5000/crops-by-year?crop=${crop}&year=${year}`);
            const cropData = getCropData.data.data;

            const updatedGeoJson = {
                ...ProvincesGeoJson,
                features: ProvincesGeoJson.features.map(
                    (feature: any) => {
                        const match = cropData.find(
                            (item: CropDetailType) => item.province === feature.properties.pro_th
                        );

                        return {
                            ...feature,
                            properties: {
                                ...feature.properties,
                                yield_per_rai: match ? match.yield_per_rai : 0,
                                yield_ton: match ? match.yield_ton : 0,
                            },
                        };
                    }
                ),
            };

            setCropCompareData(updatedGeoJson);
        } catch (error) {
            console.log(error);
        }
    };

    const fetchCropPrice = async (cropsData: CropType[]) => {
        let allPrice: PriceType[] = [];

        for (const item of cropsData) {
            const getPrice = await Axios.get(`http://localhost:5000/price-by-crop?crop=${item.name}`);
            const priceData = getPrice.data.data;
            allPrice = [...allPrice, ...priceData];
        }

        formatTreeData(cropsData, allPrice);
    }

    const formatTreeData = (cropsData: CropType[], allPrice: PriceType[]) => {
        const dataTree = cropsData.map(
            (crop: any) => {
                const price = getCropPrice(crop.name, allPrice);
                return {
                    title: (
                        <span className="flex gap-3">
                            <div className="font-bold">{crop.name}</div>
                            {price && (
                                <Tag variant="filled" color="green" className="shadow-sm">
                                    {price.product_name} - <span className="font-semibold">{`${price.day_price} ${price.unit}`}</span>
                                </Tag>
                            )}
                        </span>
                    ),
                    key: crop.name,
                    children: crop.data.map(
                        (cropDetail: CropDetailType, index: number) => ({
                            title: (
                                <div className="flex flex-col text-xs py-1">
                                    <span className="">
                                        ปี {cropDetail.year}
                                    </span>
                                    <span className="font-semibold">
                                        ผลผลิต:{" "}
                                        <span className="text-green-500">
                                            {cropDetail.yield_per_rai}
                                        </span>{" "}
                                        กก./ไร่
                                    </span>
                                </div>
                            ),
                            key: `${crop.name}-${cropDetail.year}-${index}`,
                        })
                    ),
                };
            }
        );

        setProvinceCropsData(dataTree);
    }

    const getCropPrice = (crop: string, allPrice: PriceType[]): PriceType | "" => {
        const filtered = allPrice.filter((item: PriceType) => item.product_category === crop);
            
        if (filtered.length > 0) {
            const HighestPrice = filtered.reduce((acc, curr) => {
                return curr.day_price > acc.day_price ? curr : acc;
            })

            return HighestPrice
        } else {
            return "";
        }
    }

    const fetchCropsList = async () => {
        try {
            const getCropsList = await Axios.get("http://localhost:5000/crops-list");
            const cropsListData = getCropsList.data.data;

            let options: any = [];
            for (const item of cropsListData) {
                options = [...options, {
                    value: item.name,
                    label: item.name,
                    children: item.data.map((year: string) => {
                        return {value: year, label: year}
                    })
                }]
            }

            setCropCompareOptions(options);
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
                <div className="pointer-events-none absolute bottom-5 left-5 z-10 text-9xl text-white text-sh text-shadow-lg">
                    {provinceSelected}
                </div>

                {isModalOpen && (
                    <Button
                        color="default"
                        variant="solid"
                        size="large"
                        className="absolute! top-5 left-5 z-10"
                        onClick={exitProvince}
                    >
                        ย้อนกลับ
                    </Button>
                )}

                {!isModalOpen && (
                    <div className="absolute top-5 left-5 z-10 flex flex-col rounded-md">
                        <div className="flex flex-col gap-2 p-3">
                            <div className="text-xs text-white">
                                เปรียบเทียบผลผลิต
                            </div>
                            <Segmented
                                size="small"
                                value={cropCompareType}
                                options={["ผลผลิตต่อไร่", "ผลผลิตทั้งหมด"]}
                                onChange={(value) => setCropCompareType(value)}
                                classNames={{ item: "py-1" }}
                                className="shadow-md"
                            />
                            <Cascader
                                placeholder="เลือกชนิดพืช..."
                                options={cropCompareOptions}
                                onChange={onCropsSelectedChange}
                                className="w-full! shadow-md"
                            />
                        </div>
                    </div>
                )}

                <Map
                    ref={mapRef}
                    initialViewState={{
                        longitude: 100.5,
                        latitude: 13.7,
                        zoom: 5,
                    }}
                    dragPan={!isModalOpen}
                    scrollZoom={!isModalOpen}
                    onZoom={(e) => setZoom(e.viewState.zoom)}
                    onClick={onProvinceClick}
                    mapStyle="mapbox://styles/mapbox/satellite-v9"
                    mapboxAccessToken={MAPBOX_TOKEN}
                    onMouseMove={(e) => {
                        if (e.features && e.features.length > 0) {
                            const provinceFeature = e.features.find(
                                (feature) => feature.layer?.id === "province-hover-fills"
                            );
                            const soilFeature = e.features.find(
                                (feature) => feature.layer?.id === "soil-fill"
                            );

                            const provinceCompareFeature = e.features.find(
                                (feature) => feature.layer?.id === "province-compare-fills"
                            )

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
                                })
                            }
                        } else {
                            setHoverSoil(null);
                            setHoverInfo(null);
                            setHoverCompare(null);
                        }
                    }}
                    onMouseLeave={() => {
                        setHoverSoil(null);
                        setHoverInfo(null);
                    }}
                    interactiveLayerIds={["province-hover-fills", "soil-fill", "province-compare-fills"]}
                >
                    <ProvinceSource
                        data={ProvincesGeoJson}
                        hoverData={hoverInfo}
                    />

                    {zoom >= 8 && soilData && (
                        <SoilSource data={soilData} hoverData={hoverSoil} />
                    )}

                    {cropCompareSelected && (
                        <CropCompareSource data={cropCompareData} hoverData={hoverCompare} type={cropCompareType} />
                    )}

                    <ProvinceLabelsSource data={ProvincesGeoJson} />
                </Map>

                <Modal
                    title="สถิติการเกษตร"
                    open={isModalOpen}
                    onCancel={exitProvince}
                    mask={false}
                    footer={null}
                    classNames={{
                        wrapper: "pointer-events-none",
                        title: "text-center",
                    }}
                    className="absolute! top-1/2! right-1/6 transform -translate-y-1/2"
                >
                    {provinceCropsData && (
                        <Tree
                            showLine={{ showLeafIcon: false }}
                            treeData={provinceCropsData}
                        />
                    )}
                    <ChartComponent data={cropProvinceData} />
                </Modal>
            </div>
        </div>
    );
}

export default HomePage;
