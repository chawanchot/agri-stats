import { useAppDispatch, useAppSelector } from "@store/hook";
import { setBaseMap, setMenuSelected } from "@store/slice/controlSlice";
import { setCropCompareData, setCropMainChart } from "@store/slice/cropSlice";
import { Cascader, FloatButton, Segmented, Tag, type CascaderProps } from "antd";
import { useEffect, useState } from "react";
import ProvincesData from "../assets/data/provinces.json";
import type { FeatureCollection } from "geojson";
import Axios from "axios";
import { FiLayers } from "react-icons/fi";
import type { CropDetailType, OptionType } from "types";
import { PiWarningOctagonBold } from "react-icons/pi";

const ProvincesGeoJson = ProvincesData as FeatureCollection;

const MapControlComponent = () => {
    const dispatch = useAppDispatch();
    const isModalOpen = useAppSelector((state) => state.control.modal);
    const cropCompareSelected = useAppSelector((state) => state.control.menu);
    const cropYearList: any = useAppSelector((state) => state.crop.cropYearList);
    const menuSelected = useAppSelector((state) => state.control.menu);
    
    const [layerOpen, setLayerOpen] = useState<boolean>(false);
    const [compareOptions, setCompareOptions] = useState<OptionType[] | []>([]);

    useEffect(() => {
        let options: OptionType[] = [];
        for (const item of cropYearList) {
            options = [...options, {
                value: item.name,
                label: item.name,
                children: [
                    {
                        value: "ผลผลิต",
                        label: "ผลผลิต",
                        children: item.data.map((year: string) => {
                            return {value: year, label: year}
                        })
                    },
                    {
                        value: "ราคา",
                        label: "ราคา"
                    }
                ]
            }]
        }

        setCompareOptions(options);
    }, [cropYearList])

    const onCropsSelectedChange: CascaderProps<OptionType>["onChange"] = (value) => {
        dispatch(setCropMainChart([]));
        dispatch(setCropCompareData([]));
        dispatch(setMenuSelected({ crop: "", mode: "", year: "" }));
        
        if (value) {
            if (value[1] === "ผลผลิต") {
                dispatch(setMenuSelected({ crop: value[0], mode: value[1], year: value[2] }));
                fetchCropCompareData(value[0], value[2]);
            } else if (value[1] === "ราคา") {
                dispatch(setMenuSelected({ crop: value[0], mode: value[1] }))
            }
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

    const onChangeLayer = (base: string) => {
        setLayerOpen(false);
        dispatch(setBaseMap(base));
    }

    return (
        <div>
            {!isModalOpen && (
                <>
                    <Tag variant="outlined" color="warning" icon={(<PiWarningOctagonBold />)} className="absolute! z-10 left-2 top-2 flex! items-center gap-1">หมายเหตุ: แสดงข้อมูลผลผลิตช่วงปี พ.ศ. 2563-2567</Tag>
                    <div className="absolute top-10 left-2 z-10 w-56 flex flex-col rounded-md">
                        <div className="flex flex-col gap-2">
                            <div className="text-sm text-white text-shadow-2xs">
                                เลือกข้อมูล
                            </div>
                            <Cascader
                                placeholder="เลือกข้อมูล..."
                                options={compareOptions}
                                onChange={onCropsSelectedChange}
                                className="w-full! shadow-md"
                            />
                            {menuSelected.mode === "ผลผลิต" && (
                                <Segmented
                                    size="small"
                                    value={cropCompareSelected.type}
                                    options={["ผลผลิตต่อไร่", "ผลผลิตทั้งหมด"]}
                                    onChange={(value) =>
                                        dispatch(
                                            setMenuSelected({ type: value })
                                        )
                                    }
                                    classNames={{ item: "py-1 w-full" }}
                                    className="shadow-md"
                                />
                            )}
                        </div>
                    </div>

                    <FloatButton.Group
                        open={layerOpen}
                        trigger="click"
                        placement="right"
                        classNames={{ root: "left-2.5 bottom-34! w-fit!", item: "w-15! min-h-[29px]!", trigger: "min-h-[29px]! w-[29px]! rounded! shadow-md!" }}
                        icon={<FiLayers className="text-base" />}
                        onClick={() => setLayerOpen(!layerOpen)}
                        shape="square"
                    >
                        <FloatButton content="พื้นฐาน" onClick={() => onChangeLayer("base")} />
                        <FloatButton content="เส้นทาง" onClick={() => onChangeLayer("streets")} />
                        <FloatButton content="ดาวเทียม" onClick={() => onChangeLayer("satellite")} />
                    </FloatButton.Group>
                </>
            )}
        </div>
    );
};

export default MapControlComponent;
