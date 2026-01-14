import { useAppDispatch, useAppSelector } from "@store/hook";
import { closeModal, openModal, setProvince } from "@store/slice/controlSlice";
import { setCropByProvinceData } from "@store/slice/cropSlice";
import { Modal, Tag, Tree } from "antd";
import Axios from "axios";
import { forwardRef, useEffect, useState } from "react";
import type { MapRef } from "react-map-gl/maplibre";
import ModalChartComponent from "./ModalChartComponent";

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

const ProvinceModalComponent = forwardRef<MapRef>(({}, mapRef) => {
    const dispatch = useAppDispatch();
    const isModalOpen = useAppSelector((state) => state.control.modal);
    const provinceSelected = useAppSelector((state) => state.control.province);
    const cropByProvinceData = useAppSelector((state) => state.crop.cropByProvinceData);
    const [treeData, setTreeData] = useState<any>([]);

    const exitProvince = () => {
        dispatch(closeModal());
        dispatch(setProvince(""));

        if (mapRef && typeof mapRef !== "function" && mapRef.current) {
            mapRef.current?.flyTo({
                center: [100.90, 13.18],
                zoom: 5,
                duration: 2000,
                essential: true,
            });
        }
    };

    const fetchCropByProvince = async () => {
        try {
            const getCropsByProvince = await Axios.get(`http://localhost:5000/crops-by-province?province=${provinceSelected}`);
            const cropsData = getCropsByProvince.data.data;

            dispatch(setCropByProvinceData(cropsData));
            fetchCropPrice(cropsData);

            setTimeout(() => {
                dispatch(setProvince(provinceSelected))
                dispatch(openModal());
            }, 2000);
        } catch (error) {
            console.log(error);
        }
    }

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

        setTreeData(dataTree);
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

    useEffect(() => {
        if (provinceSelected) {
            fetchCropByProvince()
        }
    }, [provinceSelected])

    return (
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
            className="absolute! top-1/2! right-[13%] transform -translate-y-1/2"
        >
            {cropByProvinceData && (
                <Tree
                    showLine={{ showLeafIcon: false }}
                    treeData={treeData}
                />
            )}
            <ModalChartComponent data={cropByProvinceData} />
        </Modal>
    );
});

export default ProvinceModalComponent;
