import type { ApexOptions } from "apexcharts";
import Chart from "react-apexcharts";
import { useEffect, useState } from "react";
import { useAppSelector } from "@store/hook";
import type { CropDetailType } from "types";
import { motion, AnimatePresence } from "framer-motion";

function MainChartComponent() {
    const [chartProvince, setChartProvince] = useState<string[]>([]);
    const [chartValue, setChartValue] = useState<number[]>([]);
    const [unit, setUnit] = useState<string>("");

    const menuSelected = useAppSelector((state) => state.control.menu);
    const cropCompareData = useAppSelector((state) => state.crop.cropMainChart);
    const provincesFilter: string[] = useAppSelector((state) => state.control.mainChartFilter);

    useEffect(() => {
        if (cropCompareData.length > 0 && provincesFilter.length > 0) {
            const filtered = cropCompareData.filter((item: any) => provincesFilter.includes(item.province));

            if (menuSelected.type === "ผลผลิตต่อไร่") {
                const sorted = filtered.sort((a: CropDetailType, b: CropDetailType) => b.yield_per_rai - a.yield_per_rai);

                const provinces = sorted.map((item: CropDetailType) => item.province);
                const values = sorted.map((item: CropDetailType) => item.yield_per_rai);

                setChartProvince(provinces);
                setChartValue(values);
                setUnit("กก./ไร่");
            } else {
                const sorted = filtered.sort((a: CropDetailType, b: CropDetailType) => b.yield_ton - a.yield_ton);

                const provinces = sorted.map((item: CropDetailType) => item.province);
                const values = sorted.map((item: CropDetailType) => item.yield_ton);

                setChartProvince(provinces);
                setChartValue(values);
                setUnit("ตัน");
            }
        } else {
            setChartProvince([]);
            setChartValue([]);
        }
    }, [cropCompareData, menuSelected.type, provincesFilter]);

    const chartOptions: ApexOptions = {
        chart: {
            toolbar: {
                show: false,
            },
            sparkline: { enabled: true },
            events: {
                dataPointSelection(_event, _chart, options) {
                    const dataIndex = options.dataPointIndex;
                    const province = options.w.config.xaxis.categories[dataIndex];

                    console.log(province);
                    // const find = ProvincesGeoJson.features.filter((item) => )
                },
            },
        },
        legend: {
            show: false,
        },
        colors: ["#10b981"],
        fill: {
            type: "gradient",
            gradient: {
                shade: "light",
                type: "horizontal",
                shadeIntensity: 0.25,
                gradientToColors: ["#34d399"],
                inverseColors: false,
                opacityFrom: 1,
                opacityTo: 1,
                stops: [0, 100],
            },
        },
        plotOptions: {
            bar: {
                horizontal: true,
                barHeight: "85%",
                dataLabels: {
                    position: "bottom",
                },
                borderRadius: 8,
                borderRadiusApplication: "end",
                hideZeroBarsWhenGrouped: true,
            },
        },
        dataLabels: {
            enabled: true,
            style: {
                colors: ["#fff"],
                fontFamily: "Kanit",
                fontWeight: 400,
                fontSize: "12px",
            },
            dropShadow: {
                enabled: true,
                blur: 3,
                opacity: 0.3,
            },
            formatter: function (val, opt) {
                return `${opt.w.globals.labels[opt.dataPointIndex]}: ${val.toLocaleString()} ${unit}`;
            },
        },
        grid: {
            show: true,
            padding: {
                left: 0,
                right: 0,
                bottom: 0,
                top: 0,
            },
            row: {
                colors: ["#f8fafc", "#f1f5f9"],
                opacity: 1,
            },
        },
        yaxis: {
            labels: {
                show: false,
            },
        },
        xaxis: {
            categories: chartProvince,
            labels: {
                show: false,
            },
        },
        tooltip: {
            enabled: false,
        },
    };

    const chartData = [
        {
            data: chartValue,
        },
    ];

    if (chartProvince.length > 0) {
        return (
            <AnimatePresence>
                <motion.div
                    initial={{ x: 100, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: 100, opacity: 0 }}
                    transition={{ type: "spring", damping: 25, stiffness: 200 }}
                    className="absolute right-4 top-4 bottom-4 z-10 w-80 rounded-2xl overflow-hidden flex flex-col bg-white/80 backdrop-blur-xl border border-white/40 shadow-xl"
                >
                    <div className="px-4 py-3 border-b border-slate-200/50 bg-linear-to-r from-emerald-50/50 to-teal-50/50">
                        <div className="flex items-center gap-2">
                            <div>
                                <h3 className="text-sm font-semibold text-slate-700">ผลผลิตรายจังหวัด</h3>
                                <p className="text-xs text-slate-500">
                                    {chartProvince.length} จังหวัด • {unit}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto overflow-x-hidden">
                        <Chart options={chartOptions} series={chartData} type="bar" height={chartProvince.length * 44} />
                    </div>
                </motion.div>
            </AnimatePresence>
        );
    }
}

export default MainChartComponent;
