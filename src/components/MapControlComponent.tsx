import { MinusOutlined, PlusOutlined } from "@ant-design/icons";
import { useAppDispatch, useAppSelector } from "@store/hook";
import { setCompareSelected } from "@store/slice/controlSlice";
import { setCropCompareData, setCropMainChart } from "@store/slice/cropSlice";
import { Cascader, FloatButton, Segmented, type CascaderProps } from "antd";
import { forwardRef, useEffect, useState } from "react";
import type { MapRef } from "react-map-gl/maplibre";
import ProvincesData from "../data/provinces.json";
import type { FeatureCollection } from "geojson";
import Axios from "axios";

const ProvincesGeoJson = ProvincesData as FeatureCollection;

type Option = {
    value: string;
    label: string;
    children?: Option[];
};

type CropDetailType = {
    crop: string;
    harvest_area: number;
    planted_area: number;
    province: string;
    year: number;
    yield_per_rai: number;
    yield_ton: number;
};

const MapControlComponent = forwardRef<MapRef>(({}, mapRef) => {
    const dispatch = useAppDispatch();
    const isModalOpen = useAppSelector((state) => state.control.modal);
    const cropCompareSelected = useAppSelector((state) => state.control.compare);
    const cropYearList: any = useAppSelector((state) => state.crop.cropYearList);

    const [compareOptions, setCompareOptions] = useState<Option[] | []>([]);

    useEffect(() => {
        let options: any = [];
        for (const item of cropYearList) {
            options = [...options, {
                value: item.name,
                label: item.name,
                children: item.data.map((year: string) => {
                    return {value: year, label: year}
                })
            }]
        }

        setCompareOptions(options);
    }, [cropYearList])

    const handleZoomIn = () => {
        if (mapRef && typeof mapRef !== "function" && mapRef.current) {
            mapRef.current?.zoomIn();
        }
    };

    const handleZoomOut = () => {
        if (mapRef && typeof mapRef !== "function" && mapRef.current) {
            mapRef.current?.zoomOut();
        }
    };

    const onCropsSelectedChange: CascaderProps<Option>["onChange"] = (value) => {
        dispatch(setCropMainChart([]));
        dispatch(setCropCompareData([]));
        dispatch(setCompareSelected({ crop: "", year: "" }));
        
        if (value) {
            dispatch(setCompareSelected({ crop: value[0], year: value[1] }));
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

            dispatch(setCropMainChart(cropData));
            dispatch(setCropCompareData(updatedGeoJson));
        } catch (error) {
            console.log(error);
        }
    };

    return (
        <div>
            {!isModalOpen && (
                <>
                    <div className="absolute top-5 left-5 z-10 flex flex-col rounded-md">
                        <div className="flex flex-col gap-2 p-3">
                            <div className="text-xs text-white">
                                เปรียบเทียบผลผลิต
                            </div>
                            <Segmented
                                size="small"
                                value={cropCompareSelected.type}
                                options={["ผลผลิตต่อไร่", "ผลผลิตทั้งหมด"]}
                                onChange={(value) =>
                                    dispatch(
                                        setCompareSelected({ type: value })
                                    )
                                }
                                classNames={{ item: "py-1" }}
                                className="shadow-md"
                            />
                            <Cascader
                                placeholder="เลือกชนิดพืช..."
                                options={compareOptions}
                                onChange={onCropsSelectedChange}
                                className="w-full! shadow-md"
                            />
                        </div>
                    </div>
                    <FloatButton.Group className="left-5 w-fit!" shape="square">
                        <FloatButton
                            onClick={handleZoomIn}
                            icon={<PlusOutlined />}
                        />
                        <FloatButton
                            onClick={handleZoomOut}
                            icon={<MinusOutlined />}
                        />
                    </FloatButton.Group>
                </>
            )}
        </div>
    );
});

export default MapControlComponent;
