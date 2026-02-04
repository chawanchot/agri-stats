import { useAppDispatch, useAppSelector } from "@store/hook";
import { setBaseMap, setMenuSelected } from "@store/slice/controlSlice";
import { setCropCompareData, setCropMainChart } from "@store/slice/cropSlice";
import { Cascader, Segmented, type CascaderProps } from "antd";
import { forwardRef, useEffect, useMemo, useState } from "react";
import ProvincesData from "../assets/data/provinces.json";
import type { FeatureCollection } from "geojson";
import { FiLayers, FiPlus, FiMinus } from "react-icons/fi";
import type { CropDetailType, OptionType } from "types";
import type { MapRef } from "react-map-gl/maplibre";

import cassavaData from "@assets/data/crops/cassava.json";
// import durianData from "@assets/data/crops/durian.json";
import longanData from "@assets/data/crops/longan.json";
import rubberData from "@assets/data/crops/rubber.json";
import maizeData from "@assets/data/crops/maize.json";
import palmData from "@assets/data/crops/palm.json";
import { AnimatePresence, motion } from "framer-motion";

const ProvincesGeoJson = ProvincesData as FeatureCollection;
const cropFiles = [cassavaData, longanData, rubberData, maizeData, palmData];

const MapControlComponent = forwardRef<MapRef>(({}, mapRef) => {
    const dispatch = useAppDispatch();
    const isModalOpen = useAppSelector((state) => state.control.modal);
    const cropCompareSelected = useAppSelector((state) => state.control.menu);
    const cropYearList: any = useAppSelector((state) => state.crop.cropYearList);
    const menu_selected = useAppSelector((state) => state.control.menu);

    const [layerOpen, setLayerOpen] = useState<boolean>(false);
    const [compareOptions, setCompareOptions] = useState<OptionType[] | []>([]);

    const cascaderValue = useMemo(() => {
        if (menu_selected?.crop && menu_selected?.mode) {
            if (menu_selected?.mode === "ผลผลิต") {
                return [menu_selected.crop, menu_selected.mode, menu_selected.year].filter(Boolean);
            } else {
                return [menu_selected.crop, menu_selected.mode];
            }
        } else {
            return undefined;
        }
    }, [menu_selected]);

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

    const handleZoomIn = () => {
        if (mapRef && typeof mapRef !== "function" && mapRef.current) {
            mapRef.current.zoomIn();
        }
    };

    const handleZoomOut = () => {
        if (mapRef && typeof mapRef !== "function" && mapRef.current) {
            mapRef.current.zoomOut();
        }
    };

    return (
        <AnimatePresence>
            {!isModalOpen && (
                <>
                    <motion.div
                        initial={{ x: -100, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: -100, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="absolute top-5 left-4 z-10 w-64 p-4 rounded-2xl bg-[#131b2d]"
                    >
                        <div className="flex flex-col gap-4">
                            <div className="flex flex-col gap-2">
                                <div className="text-sm text-white">เลือกข้อมูล</div>
                                <div>
                                    <label className="text-xs text-[#94a3b8]">ชนิดพืช และ ปีที่ต้องการ</label>
                                    <Cascader
                                        placeholder="เลือกพืช และปี..."
                                        options={compareOptions}
                                        value={cascaderValue}
                                        onChange={onCropsSelectedChange}
                                        className="[&_.ant-select-content-value]:text-[#10b981]! [&_.ant-select-content-value]:font-bold!"
                                        classNames={{
                                            root: "w-full! bg-[#1e293b]! border-none! drop-shadow! rounded-xl!",
                                            content: "text-white! py-1",
                                            suffix: "text-white!",
                                            placeholder: "text-white!",
                                            popup: { root: "bg-[#1e293b]!", listItem: "text-white hover:bg-[#131b2d]!" },
                                        }}
                                    />
                                </div>
                                {menu_selected.mode === "ผลผลิต" && (
                                    <div className="flex flex-col gap-2">
                                        <label className="text-xs text-[#94a3b8]">ประเภทข้อมูล</label>
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
                                            className="[&_.ant-segmented-item-selected]:font-bold [&_.ant-segmented-item-selected]:drop-shadow-lg [&_.ant-segmented-item]:text-[#94a3b8]"
                                            classNames={{
                                                root: "rounded-xl! bg-[#1e293b]! drop-shadow py-1!",
                                            }}
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                    </motion.div>

                    {/* Zoom | Layer Control */}
                    <motion.div
                        initial={{ x: -100, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: -100, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="absolute left-4 bottom-5 z-10 flex flex-col gap-2"
                    >
                        <div className="flex flex-col">
                            <button
                                onClick={handleZoomIn}
                                className="w-11 h-11 rounded-t-xl bg-[#1e293b] text-white cursor-pointer flex items-center justify-center hover:bg-[#10b981] duration-100 border-b border-[#2d3748]"
                            >
                                <FiPlus className="text-xl" />
                            </button>
                            <button
                                onClick={handleZoomOut}
                                className="w-11 h-11 rounded-b-xl bg-[#1e293b] text-white cursor-pointer flex items-center justify-center hover:bg-[#10b981] duration-100"
                            >
                                <FiMinus className="text-xl" />
                            </button>
                        </div>
                        <button
                            onClick={() => setLayerOpen(!layerOpen)}
                            className={`w-11 h-11 rounded-xl flex items-center justify-center cursor-pointer ${
                                layerOpen ? "bg-[#10b981] text-white" : "bg-[#1e293b] text-white hover:bg-[#10b981]"
                            }`}
                        >
                            <FiLayers className="text-lg" />
                        </button>

                        <AnimatePresence>
                            {layerOpen && (
                                <motion.div
                                    initial={{ x: -10, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    exit={{ x: -10, opacity: 0 }}
                                    transition={{ duration: 0.15 }}
                                    className="ml-14 -mt-11 flex gap-2"
                                >
                                    <button
                                        onClick={() => onChangeLayer("base")}
                                        className="px-4 py-2 rounded-xl bg-[#1e293b] text-sm cursor-pointer font-medium text-white hover:bg-[#10b981] duration-100"
                                    >
                                        พื้นฐาน
                                    </button>
                                    <button
                                        onClick={() => onChangeLayer("streets")}
                                        className="px-4 py-2 rounded-xl bg-[#1e293b] text-sm cursor-pointer font-medium text-white hover:bg-[#10b981] duration-100"
                                    >
                                        เส้นทาง
                                    </button>
                                    <button
                                        onClick={() => onChangeLayer("satellite")}
                                        className="px-4 py-2 rounded-xl bg-[#1e293b] text-sm cursor-pointer font-medium text-white hover:bg-[#10b981] duration-100"
                                    >
                                        ดาวเทียม
                                    </button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
});

export default MapControlComponent;
