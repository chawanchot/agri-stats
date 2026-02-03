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
import durianData from "@assets/data/crops/durian.json";
import longanData from "@assets/data/crops/longan.json";
import rubberData from "@assets/data/crops/rubber.json";
import maizeData from "@assets/data/crops/maize.json";
import palmData from "@assets/data/crops/palm.json";

const ProvinceModalComponent = forwardRef<MapRef>(({}, mapRef) => {
    const dispatch = useAppDispatch();
    const isModalOpen = useAppSelector((state) => state.control.modal);
    const provinceSelected = useAppSelector((state) => state.control.province);
    const cropByProvinceData = useAppSelector((state) => state.crop.cropByProvinceData);
    const [treeData, setTreeData] = useState<any>([]);
    const cropFiles = [cassavaData, durianData, longanData, rubberData, maizeData, palmData];

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
                const filtered = jsonData.filter((item: CropDetailType) => item.province === provinceSelected);

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
                dispatch(setProvince(provinceSelected));
                dispatch(openModal());
            }, 2000);
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
    };

    const formatTreeData = (cropsData: CropType[], allPrice: PriceType[]) => {
        const dataTree = cropsData.map((crop: any) => {
            const price = getCropPrice(crop.name, allPrice);
            return {
                title: (
                    <span className="flex items-center gap-2">
                        <div className="font-semibold text-slate-700">{crop.name}</div>
                        {price && (
                            <Tag variant="filled" color="green" className="shadow-sm text-xs! rounded-lg!">
                                {price.product_name} •{" "}
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
        if (provinceSelected) {
            fetchCropByProvince();
        }
    }, [provinceSelected]);

    return (
        <AnimatePresence>
            {isModalOpen && (
                <motion.div
                    initial={{ opacity: 0, x: 100, scale: 0.95 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    exit={{ opacity: 0, x: 100, scale: 0.95 }}
                    transition={{ type: "spring", damping: 25, stiffness: 200 }}
                    className="fixed top-1/2 right-1/6 -translate-y-1/2 z-50 w-130 max-h-[85vh] rounded-2xl bg-white/85 backdrop-blur-xl border border-white/40 shadow-2xl overflow-hidden flex flex-col"
                >
                    <div className="px-5 py-4 border-b border-slate-200/50 bg-linear-to-r from-emerald-50/50 to-teal-50/50">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center">
                                    <FiMapPin className="text-white text-lg" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold text-slate-800">{provinceSelected}</h2>
                                    <p className="text-xs text-slate-500">สถิติการเกษตร</p>
                                </div>
                            </div>
                            <button
                                onClick={exitProvince}
                                className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-red-100 hover:text-red-500 flex items-center justify-center transition-all duration-200 text-slate-400"
                            >
                                <FiX className="text-base" />
                            </button>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4">
                        {cropByProvinceData && treeData.length > 0 && (
                            <div className="mb-4">
                                <div className="bg-white/60 rounded-xl p-3 border border-slate-100">
                                    <div className="flex items-center gap-2 mb-3">
                                        <FiTrendingUp className="text-emerald-500" />
                                        <span className="text-sm font-semibold text-slate-700">ข้อมูลพืชผล</span>
                                    </div>
                                    <Tree showLine={{ showLeafIcon: false }} treeData={treeData} className="bg-transparent!" />
                                </div>
                            </div>
                        )}

                        <div className="bg-white/60 rounded-xl p-3 border border-slate-100">
                            <ModalChartComponent data={cropByProvinceData} />
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
});

export default ProvinceModalComponent;
