import { useAppDispatch, useAppSelector } from "@store/hook";
import { setBaseMap, setMenuSelected } from "@store/slice/controlSlice";
import { setCropCompareData, setCropMainChart } from "@store/slice/cropSlice";
import { Cascader, Segmented, type CascaderProps } from "antd";
import { useEffect, useState } from "react";
import ProvincesData from "../assets/data/provinces.json";
import type { FeatureCollection } from "geojson";
import { FiLayers, FiInfo } from "react-icons/fi";
import type { CropDetailType, OptionType } from "types";

import cassavaData from "@assets/data/crops/cassava.json";
import durianData from "@assets/data/crops/durian.json";
import longanData from "@assets/data/crops/longan.json";
import rubberData from "@assets/data/crops/rubber.json";
import maizeData from "@assets/data/crops/maize.json";
import palmData from "@assets/data/crops/palm.json";

const ProvincesGeoJson = ProvincesData as FeatureCollection;
const cropFiles = [cassavaData, durianData, longanData, rubberData, maizeData, palmData];

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
            options = [
                ...options,
                {
                    value: item.name,
                    label: item.name,
                    children: [
                        {
                            value: "ผลผลิต",
                            label: "ผลผลิต",
                            children: item.data.map((year: string) => {
                                return { value: year, label: year };
                            }),
                        },
                        {
                            value: "ราคา",
                            label: "ราคา",
                        },
                    ],
                },
            ];
        }

        setCompareOptions(options);
    }, [cropYearList]);

    const onCropsSelectedChange: CascaderProps<OptionType>["onChange"] = (value) => {
        dispatch(setCropMainChart([]));
        dispatch(setCropCompareData([]));
        dispatch(setMenuSelected({ crop: "", mode: "", year: "" }));

        if (value) {
            if (value[1] === "ผลผลิต") {
                dispatch(
                    setMenuSelected({
                        crop: value[0],
                        mode: value[1],
                        year: value[2],
                    })
                );
                fetchCropCompareData(value[0], value[2]);
            } else if (value[1] === "ราคา") {
                dispatch(setMenuSelected({ crop: value[0], mode: value[1] }));
            }
        }
    };

    const fetchCropCompareData = async (crop: string, year: string) => {
        try {
            let cropData: CropDetailType[] = [];

            cropFiles.forEach((jsonData: any) => {
                const filtered = jsonData.filter((item: CropDetailType) => item.crop === crop && item.year === Number(year));

                if (filtered.length > 0) {
                    cropData.push(...filtered);
                }
            });

            const updatedGeoJson = {
                ...ProvincesGeoJson,
                features: ProvincesGeoJson.features.map((feature: any) => {
                    const match = cropData.find((item: CropDetailType) => item.province === feature.properties.pro_th);

                    return {
                        ...feature,
                        properties: {
                            ...feature.properties,
                            yield_per_rai: match ? match.yield_per_rai : 0,
                            yield_ton: match ? match.yield_ton : 0,
                        },
                    };
                }),
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
    };

    return (
        <div>
            {!isModalOpen && (
                <>
                    <div className="absolute z-10 left-4 top-4 px-3 py-2 rounded-xl flex items-center gap-2 text-sm text-slate-600 bg-white/75 backdrop-blur-md border border-white/30 shadow-lg transition-all duration-300 hover:shadow-xl">
                        <FiInfo className="text-emerald-500" />
                        <span>ข้อมูลผลผลิตปี พ.ศ. 2563-2567</span>
                    </div>

                    <div className="absolute top-16 left-4 z-10 w-64 p-4 rounded-2xl bg-white/75 backdrop-blur-md border border-white/30 shadow-lg transition-all duration-300 hover:shadow-xl">
                        <div className="flex flex-col gap-4">
                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-medium text-slate-700">เลือกข้อมูล</label>
                                <Cascader
                                    placeholder="เลือกพืช และปี..."
                                    options={compareOptions}
                                    onChange={onCropsSelectedChange}
                                    className="w-full!"
                                    style={{
                                        boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                                        borderRadius: "10px",
                                    }}
                                />
                            </div>

                            {menuSelected.mode === "ผลผลิต" && (
                                <div className="flex flex-col gap-2">
                                    <label className="text-sm font-medium text-slate-700">ประเภทข้อมูล</label>
                                    <Segmented
                                        size="middle"
                                        value={cropCompareSelected.type}
                                        options={["ผลผลิตต่อไร่", "ผลผลิตทั้งหมด"]}
                                        onChange={(value) =>
                                            dispatch(
                                                setMenuSelected({
                                                    type: value,
                                                })
                                            )
                                        }
                                        block
                                        className="rounded-xl!"
                                        style={{
                                            padding: "4px",
                                            background: "rgba(0,0,0,0.04)",
                                        }}
                                    />
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="absolute left-4 bottom-8 z-10">
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setLayerOpen(!layerOpen)}
                                className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-300 shadow-lg ${
                                    layerOpen
                                        ? "bg-emerald-500 text-white"
                                        : "bg-white/80 backdrop-blur-md text-slate-600 hover:bg-white hover:shadow-xl"
                                }`}
                            >
                                <FiLayers className="text-lg" />
                            </button>

                            {layerOpen && (
                                <div className="flex gap-2 animate-in slide-in-from-left-2 duration-200">
                                    <button
                                        onClick={() => onChangeLayer("base")}
                                        className="px-4 py-2 rounded-xl bg-white/80 backdrop-blur-md text-sm font-medium text-slate-600 hover:bg-emerald-500 hover:text-white transition-all duration-200 shadow-lg hover:shadow-xl"
                                    >
                                        พื้นฐาน
                                    </button>
                                    <button
                                        onClick={() => onChangeLayer("streets")}
                                        className="px-4 py-2 rounded-xl bg-white/80 backdrop-blur-md text-sm font-medium text-slate-600 hover:bg-emerald-500 hover:text-white transition-all duration-200 shadow-lg hover:shadow-xl"
                                    >
                                        เส้นทาง
                                    </button>
                                    <button
                                        onClick={() => onChangeLayer("satellite")}
                                        className="px-4 py-2 rounded-xl bg-white/80 backdrop-blur-md text-sm font-medium text-slate-600 hover:bg-emerald-500 hover:text-white transition-all duration-200 shadow-lg hover:shadow-xl"
                                    >
                                        ดาวเทียม
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default MapControlComponent;
