import { useAppDispatch, useAppSelector } from "@store/hook";
import { closeModal, openModal, setProvince } from "@store/slice/controlSlice";
import { setCropByProvinceData } from "@store/slice/cropSlice";
import { Tag, Tree } from "antd";
import Axios from "axios";
import { forwardRef, useEffect, useState } from "react";
import type { MapRef } from "react-map-gl/maplibre";
import ModalChartComponent from "./ModalChartComponent";
import type { CropDetailType, CropType, PriceType } from "types";
import { motion, AnimatePresence } from "framer-motion";
import { FiMapPin, FiTrendingUp, FiX } from "react-icons/fi";

import cassavaData from "@assets/data/crops/cassava.json";
// import durianData from "@assets/data/crops/durian.json";
import longanData from "@assets/data/crops/longan.json";
import rubberData from "@assets/data/crops/rubber.json";
import maizeData from "@assets/data/crops/maize.json";
import palmData from "@assets/data/crops/palm.json";

const ProvinceModalComponent = forwardRef<MapRef>(({}, mapRef) => {
    const dispatch = useAppDispatch();
    const isModalOpen = useAppSelector((state) => state.control.modal);
    const province_selected = useAppSelector((state) => state.control.province);
    const cropByProvinceData = useAppSelector((state) => state.crop.cropByProvinceData);
    const [treeData, setTreeData] = useState<any>([]);
    const cropFiles = [cassavaData, longanData, rubberData, maizeData, palmData];

    const exitProvince = () => {
        dispatch(closeModal());
        dispatch(setProvince(""));

        if (mapRef && typeof mapRef !== "function" && mapRef.current) {
            mapRef.current?.flyTo({
                center: [100.9, 13.18],
                zoom: 5,
                duration: 2000,
                essential: true,
            });
        }
    };

    const fetchCropByProvince = async () => {
        try {
            let cropsData: CropType[] = [];

            cropFiles.forEach((jsonData: any) => {
                const filtered = jsonData.filter((item: CropDetailType) => item.province === province_selected);

                if (filtered.length > 0) {
                    const cropName = filtered[0].crop;
                    const existingCrop = cropsData.find((crop) => crop.name === cropName);

                    if (existingCrop) {
                        existingCrop.data.push(...filtered);
                    } else {
                        cropsData.push({
                            name: cropName,
                            data: filtered,
                        });
                    }
                }
            });

            dispatch(setCropByProvinceData(cropsData));
            fetchCropPrice(cropsData);

            setTimeout(() => {
                dispatch(setProvince(province_selected));
                dispatch(openModal());
            }, 2000);
        } catch (error) {
            console.log(error);
        }
    };

    const fetchCropPrice = async (cropsData: CropType[]) => {
        let allPrice: PriceType[] = [];

        for (const item of cropsData) {
            const getPrice = await Axios.get(`https://mu2f.dev/price-by-crop?crop=${item.name}`);
            const priceData = getPrice.data.data;
            allPrice = [...allPrice, ...priceData];
        }

        formatTreeData(cropsData, allPrice);
    };

    const formatTreeData = (cropsData: CropType[], allPrice: PriceType[]) => {
        const dataTree = cropsData.map((crop: any) => {
            const price = getCropPrice(crop.name, allPrice);
            return {
                title: (
                    <span className="flex flex-col md:flex-row items-start md:items-center justify-between">
                        <div className="font-medium text-xs md:text-base text-[#F1F5F9]">{crop.name}</div>
                        {price && (
                            <Tag variant="filled" className="drop-shadow-lg font-normal text-[10px]! md:text-xs! rounded-lg! bg-[#0D3033]! text-[#34D399]!">
                                {price.product_name} -{" "}
                                <span className="font-bold">
                                    {price.day_price} {price.unit}
                                </span>
                            </Tag>
                        )}
                    </span>
                ),
                key: crop.name,
                children: crop.data.map((cropDetail: CropDetailType, index: number) => ({
                    title: (
                        <div className="flex flex-col text-xs py-1.5 px-2 rounded-lg hover:bg-slate-50 transition-colors">
                            <span className="text-slate-500">ปี {cropDetail.year}</span>
                            <span className="font-medium text-slate-700">
                                ผลผลิต:{" "}
                                <span className="text-emerald-600 font-bold">{cropDetail.yield_per_rai.toLocaleString()}</span>{" "}
                                <span className="text-slate-400">กก./ไร่</span>
                            </span>
                        </div>
                    ),
                    key: `${crop.name}-${cropDetail.year}-${index}`,
                })),
            };
        });

        setTreeData(dataTree);
    };

    const getCropPrice = (crop: string, allPrice: PriceType[]): PriceType | "" => {
        const filtered = allPrice.filter((item: PriceType) => item.product_category === crop);

        if (filtered.length > 0) {
            const HighestPrice = filtered.reduce((acc, curr) => {
                return curr.day_price > acc.day_price ? curr : acc;
            });

            return HighestPrice;
        } else {
            return "";
        }
    };

    useEffect(() => {
        if (province_selected) {
            fetchCropByProvince();
        }
    }, [province_selected]);

    return (
        <AnimatePresence>
            {isModalOpen && (
                <motion.div
                    initial={{ opacity: 0, x: 100, scale: 0.95 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    exit={{ opacity: 0, x: 100, scale: 0.95 }}
                    transition={{ type: "spring", damping: 25, stiffness: 200 }}
                    className="absolute md:top-1/2 md:right-[12%] md:-translate-y-1/2 z-50 w-[95%] md:w-130 max-h-[95%] rounded-2xl bg-[#131b2d] shadow-2xl overflow-hidden flex flex-col"
                >
                    <div className="px-5 py-4 bg-[#131b2d]">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl bg-[#10b981] flex items-center justify-center">
                                    <FiMapPin className="text-white text-lg" />
                                </div>
                                <div>
                                    <h2 className="text-base md:text-xl font-semibold text-white">{province_selected}</h2>
                                    <p className="text-[10px] md:text-xs text-[#94a3b8]">สถิติการเกษตร</p>
                                </div>
                            </div>
                            <button
                                onClick={exitProvince}
                                className="w-8 h-8 rounded-full bg-[#1e293b] flex items-center justify-center transition-all duration-200 cursor-pointer"
                            >
                                <FiX className="text-base text-[#94a3b8]" />
                            </button>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto px-4 pb-4 pt-0 md:pt-2">
                        {cropByProvinceData && treeData.length > 0 && (
                            <div className="mb-4">
                                <div className="bg-[#1e293b] rounded-xl p-3">
                                    <div className="flex items-center gap-2 mb-3">
                                        <FiTrendingUp className="text-[#10b981]" />
                                        <span className="text-sm font-medium text-white">ข้อมูลพืชผล</span>
                                    </div>
                                    <Tree
                                        showLine={{ showLeafIcon: false }}
                                        treeData={treeData}
                                        className="bg-transparent! [&_.ant-tree-switcher-line-icon]:text-[#94a3b8]! [&_.ant-tree-treenode]:w-full! [&_.ant-tree-node-content-wrapper]:w-full"
                                    />
                                </div>
                            </div>
                        )}

                        <div className="bg-[#1e293b] rounded-xl p-3">
                            <ModalChartComponent data={cropByProvinceData} />
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
});

export default ProvinceModalComponent;
