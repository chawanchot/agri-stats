import type { ApexOptions } from "apexcharts";
import Chart from "react-apexcharts";
import type { CropType } from "types";
import { FiActivity } from "react-icons/fi";

type PropsType = {
    data: CropType[];
};

function ModalChartComponent({ data }: PropsType) {
    const categories = Array.from(new Set(data.flatMap((cropGroup) => cropGroup.data.map((item) => item.year)))).sort(
        (a, b) => a - b
    );

    const chartData = data.map((cropGroup) => ({
        name: cropGroup.name,
        data: categories.map((year) => {
            const yearlyRecord = cropGroup.data.find((item) => item.year === year);

            return yearlyRecord ? yearlyRecord.yield_per_rai : 0;
        }),
    }));

    const chartOptions: ApexOptions = {
        chart: {
            toolbar: {
                show: false,
            },
            fontFamily: "Noto Sans Thai",
            background: "transparent",
        },
        colors: ["#10b981", "#6366f1", "#f59e0b", "#ef4444", "#cf4421"],
        stroke: {
            curve: "smooth",
            width: 3,
        },
        markers: {
            size: 0,
        },
        dataLabels: {
            enabled: false,
        },
        grid: {
            borderColor: "#414B60",
            strokeDashArray: 4,
        },
        xaxis: {
            categories: categories.map(String),
            labels: {
                style: {
                    colors: "#64748b",
                    fontSize: "12px",
                },
            },
        },
        yaxis: {
            labels: {
                style: {
                    colors: "#64748b",
                    fontSize: "12px",
                },
                formatter: (val) => val.toLocaleString(),
            },
        },
        legend: {
            position: "bottom",
            horizontalAlign: "center",
            fontSize: "12px",
            fontWeight: 400,
            labels: {
                colors: "#F1F5F9",
            },
            markers: {
                size: 8,
                shape: "circle",
                strokeWidth: 0,
            },
        },
        tooltip: {
            enabled: false,
            theme: "light",
            y: {
                formatter: (val) => `${val.toLocaleString()} กก./ไร่`,
            },
        },
    };

    if (data.length === 0) {
        return null;
    }

    return (
        <div>
            <div className="flex items-center gap-2 mb-2">
                <FiActivity className="text-[#10b981]" />
                <span className="text-sm font-medium text-white">ผลผลิตรายปี</span>
            </div>
            <Chart options={chartOptions} series={chartData} type="line" height={220} />
        </div>
    );
}

export default ModalChartComponent;
