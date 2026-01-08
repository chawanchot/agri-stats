import Map, { type MapRef } from "react-map-gl/mapbox";
import "mapbox-gl/dist/mapbox-gl.css";
import ProvincesData from "../data/provinces.json";
import type { FeatureCollection } from "geojson";
import { useRef, useState } from "react";
import Axios from "axios";
import { Button, Cascader, Modal, Tree, type CascaderProps } from "antd";
import HeadMapCrop from "@components/HeadMapCrop";
import SoilSource from "@components/SoilSource";
import ProvinceSource from "@components/ProvinceSource";
import ProvinceLabelsSource from "@components/ProvinceLabelsSource";
import ChartComponent from "@components/ChartComponent";

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;
const ProvincesGeoJson = ProvincesData as FeatureCollection;

type CropType = {
    crop: string;
    harvest_area: number;
    planted_area: number;
    province: string;
    year: number;
    yield_per_rai: number;
    yield_ton: number;
};

type Option = {
    value: string;
    label: string;
    children?: Option[];
};

function HomePage() {
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [hoverInfo, setHoverInfo] = useState<string | null>(null);
    const [provinceSelected, setProvinceSelected] = useState<string | null>(null);
    const [soilData, setSoilData] = useState(null);
    const [hoverSoil, setHoverSoil] = useState<any>(null);
    const [cropSelected, setCropSelected] = useState<string[] | undefined>(undefined);
    const [cropCompareData, setCropCompareData] = useState<FeatureCollection>(ProvincesGeoJson);
    const [provinceCropsData, setProvinceCropsData] = useState<any>([]);
    const [zoom, setZoom] = useState(5);

    const mapRef = useRef<MapRef>(null);

    const cropsSelectOptions: Option[] = [
        {
            value: "ทุเรียน",
            label: "ทุเรียน",
            children: [
                {
                    value: "2566",
                    label: "2566",
                },
                {
                    value: "2567",
                    label: "2567",
                },
            ],
        },
        {
            value: "ยางพารา",
            label: "ยางพารา",
            children: [
                {
                    value: "2566",
                    label: "2566",
                },
                {
                    value: "2567",
                    label: "2567",
                },
            ],
        },
    ];

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
                const data = await import(`./data/soils/${soilName}.json`);

                setSoilData(data.default);
            } catch (error) {
                setSoilData(null);
            }

            Axios.get(`http://localhost:5000/crops-province?province=${pro_th}`)
                .then((resp) => {
                    if (resp.data.status) {
                        const responseData = resp.data.data;

                        const dataTree = Object.keys(responseData).map(
                            (cropName) => {
                                return {
                                    title: (
                                        <span className="font-bold">
                                            {cropName}
                                        </span>
                                    ),
                                    key: cropName,
                                    children: responseData[cropName].map(
                                        (item: any, index: number) => ({
                                            title: (
                                                <div className="flex flex-col text-xs py-1">
                                                    <span className="font-semibold">
                                                        ปี {item.year}
                                                    </span>
                                                    <span className="text-gray-500">
                                                        ผลผลิต:{" "}
                                                        <span className="text-green-500">
                                                            {item.yield_per_rai}
                                                        </span>{" "}
                                                        กก./ไร่
                                                    </span>
                                                </div>
                                            ),
                                            key: `${cropName}-${item.year}-${index}`,
                                        })
                                    ),
                                };
                            }
                        );

                        setProvinceCropsData(dataTree);

                        setTimeout(() => {
                            setIsModalOpen(true);
                            setProvinceSelected(pro_th);
                        }, 2000);
                    }
                })
                .catch((err) => {
                    console.log(err);
                });
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
        setCropSelected(value);

        if (value) {
            getCropData(value[0], value[1]);
        }
    };

    const getCropData = (crop: string, year: string) => {
        Axios.get(`http://localhost:5000/crops?crop=${crop}&year=${year}`)
            .then((resp) => {
                if (resp.data.status) {
                    const apiData = resp.data.data;

                    const updatedGeoJson = {
                        ...ProvincesGeoJson,
                        features: ProvincesGeoJson.features.map(
                            (feature: any) => {
                                const match = apiData.find(
                                    (item: CropType) =>
                                        item.province ===
                                        feature.properties.pro_th
                                );

                                return {
                                    ...feature,
                                    properties: {
                                        ...feature.properties,
                                        yield_weight: match
                                            ? match.yield_per_rai
                                            : 0,
                                    },
                                };
                            }
                        ),
                    };

                    setCropCompareData(updatedGeoJson);
                }
            })
            .catch((err) => {
                console.error(err);
            });
    };

    return (
        <div className="flex items-center justify-center h-full">
            <div className="w-full h-full">
                <div className="absolute bottom-5 left-5 z-10 text-9xl text-white text-sh text-shadow-lg">
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
                    <div className="absolute top-5 left-5 z-10 flex flex-col rounded-md bg-white shadow-xl">
                        <div className="flex flex-col p-5">
                            <div className="text-xs mb-1">
                                เปรียบเทียบผลผลิต
                            </div>
                            <Cascader
                                placeholder="เลือกชนิดพืช..."
                                options={cropsSelectOptions}
                                onChange={onCropsSelectedChange}
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
                                (feature) =>
                                    feature.layer?.id === "province-hover-fills"
                            );
                            const soilFeature = e.features.find(
                                (feature) => feature.layer?.id === "soil-fill"
                            );

                            if (provinceFeature) {
                                setHoverInfo(
                                    provinceFeature.properties?.pro_th
                                );
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
                        } else {
                            setHoverSoil(null);
                            setHoverInfo(null);
                        }
                    }}
                    onMouseLeave={() => {
                        setHoverSoil(null);
                        setHoverInfo(null);
                    }}
                    interactiveLayerIds={["province-hover-fills", "soil-fill"]}
                >
                    <ProvinceLabelsSource data={ProvincesGeoJson} />
                    <ProvinceSource
                        data={ProvincesGeoJson}
                        hoverData={hoverInfo}
                    />

                    {zoom >= 8 && soilData && (
                        <SoilSource data={soilData} hoverData={hoverSoil} />
                    )}

                    {cropSelected && <HeadMapCrop data={cropCompareData} />}
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
                    <ChartComponent />
                </Modal>
            </div>
        </div>
    );
}

export default HomePage;
