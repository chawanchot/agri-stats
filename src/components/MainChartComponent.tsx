import type { ApexOptions } from "apexcharts";
import Chart from "react-apexcharts";
import { useEffect, useState } from "react";
import { useAppSelector } from "@store/hook";


type CropDetailType = {
    crop: string;
    harvest_area: number;
    planted_area: number;
    province: string;
    year: number;
    yield_per_rai: number;
    yield_ton: number;
};

function MainChartComponent() {
    const [chartProvince, setChartProvince] = useState<string[]>([]);
    const [chartValue, setChartValue] = useState<number[]>([]);
    const [unit, setUnit] = useState<string>("");

    const cropCompareSelected = useAppSelector((state) => state.control.compare);
    const cropCompareData = useAppSelector((state) => state.crop.cropMainChart);
    const provincesFilter: string[] = useAppSelector((state) => state.control.mainChartFilter);

    useEffect(() => {
        if (cropCompareData.length > 0 && provincesFilter.length > 0) {
            const filtered = cropCompareData.filter((item: any) => provincesFilter.includes(item.province));

            if (cropCompareSelected.type === "ผลผลิตต่อไร่") {
                const sorted = filtered.sort(
                    (a: CropDetailType, b: CropDetailType) => b.yield_per_rai - a.yield_per_rai
                );

                const provinces = sorted.map((item: CropDetailType) => item.province);
                const values = sorted.map((item: CropDetailType) => item.yield_per_rai);

                setChartProvince(provinces);
                setChartValue(values);
                setUnit("กก./ไร่");
            } else {
                const sorted = filtered.sort(
                    (a: CropDetailType, b: CropDetailType) => b.yield_ton - a.yield_ton
                );

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
    }, [cropCompareData, cropCompareSelected.type, provincesFilter]);

    const chartOptions: ApexOptions = {
        chart: {
            toolbar: {
                show: false,
            },
            sparkline: { enabled: true },
        },
        legend: {
            show: false,
        },
        colors: ["#318526"],
        plotOptions: {
            bar: {
                horizontal: true,
                barHeight: "90%",
                dataLabels: {
                    position: "bottom",
                },
                borderRadius: 5,
                borderRadiusApplication: "end",
            },
        },
        dataLabels: {
            enabled: true,
            style: {
                colors: ["#fff"],
                fontFamily: "Kanit",
                fontWeight: 400,
            },
            dropShadow: {
                enabled: true,
            },
            formatter: function (val, opt) {
                return `${
                    opt.w.globals.labels[opt.dataPointIndex]
                }: ${val.toLocaleString()} ${unit}`;
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
                colors: ["#d9d9d9", "#c7c7c7"],
                opacity: 0.8,
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

    if (cropCompareData.length > 0) {
        return (
            <>
                {cropCompareData.length && (
                    <div className="absolute right-0 z-10 bg-white h-full overflow-y-auto overflow-x-hidden w-80">
                        <Chart
                            options={chartOptions}
                            series={chartData}
                            type="bar"
                            height={chartProvince.length * 40}
                        />
                    </div>
                )}
            </>
        );
    }
}

export default MainChartComponent;
