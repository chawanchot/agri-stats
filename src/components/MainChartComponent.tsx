import type { ApexOptions } from "apexcharts";
import Chart from "react-apexcharts";
import { useEffect, useState } from 'react';

type PropsType = {
    data: any
}

function MainChartComponent({ data }: PropsType) {
    const [chartProvince, setChartProvince] = useState<string[]>([]);
    const [chartValue, setChartValue] = useState<number[]>([]);

    useEffect(() => {
        if (data.length > 0) {
            data.map((item: any) => {
                setChartProvince((prev: any) => [...prev, item.province])
                setChartValue((prev) => [...prev, item.yield_per_rai])
            })
        } else {
            setChartProvince([]);
            setChartValue([]);
        }
    }, [data])

    const chartOptions: ApexOptions = {
        chart: {
            toolbar: {
                show: false,
            },
        },
        legend: {
            show: false,
        },
        plotOptions: {
            bar: {
                horizontal: true,
                barHeight: "90%",
                distributed: true,
                dataLabels: {
                    position: "bottom",
                },
            },
        },
        dataLabels: {
            enabled: true,
            textAnchor: "start",
            style: {
                colors: ["#fff"],
            },
            formatter: function (val, opt) {
                return opt.w.globals.labels[opt.dataPointIndex] + ":  " + val;
            },
            offsetX: 0,
            dropShadow: {
                enabled: true,
            },
        },
        grid: {
            row: {
                colors: ["#f3f3f3", "transparent"],
                opacity: 0.5,
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
            x: {
                show: false,
            },
            y: {
                title: {
                    formatter: function () {
                        return "";
                    },
                },
            },
        },
    };

    const chartData = [
        {
            data: chartValue,
        },
    ];

    if (data.length > 0) {
        return (
            <>
                {data.length && (
                    <div className="absolute right-0 z-10 bg-white h-full overflow-y-auto overflow-x-hidden">
                        <Chart
                            options={chartOptions}
                            series={chartData}
                            type="bar"
                            height={data.length * 40}
                        />
                    </div>
                )}
            </>
        );
    } 
}

export default MainChartComponent;
