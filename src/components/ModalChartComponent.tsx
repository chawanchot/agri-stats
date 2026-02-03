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
            fontFamily: "Kanit",
            background: "transparent",
        },
        colors: ["#10b981", "#6366f1", "#f59e0b", "#ef4444"],
        stroke: {
            curve: "smooth",
            width: 3,
        },
        markers: {
            size: 4,
            strokeWidth: 2,
            hover: {
                size: 6,
            },
        },
        dataLabels: {
            enabled: false,
        },
        grid: {
            borderColor: "#e2e8f0",
            strokeDashArray: 4,
            row: {
                colors: ["transparent"],
                opacity: 0.5,
            },
        },
        xaxis: {
            categories: categories.map(String),
            labels: {
                style: {
                    colors: "#64748b",
                    fontSize: "12px",
                },
            },
            axisBorder: {
                show: false,
            },
            axisTicks: {
                show: false,
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
            position: "top",
            horizontalAlign: "left",
            fontSize: "12px",
            fontWeight: 500,
            labels: {
                colors: "#475569",
            },
            markers: {
                size: 8,
                shape: "circle",
            },
        },
        tooltip: {
            enabled: true,
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
                <FiActivity className="text-emerald-500" />
                <span className="text-sm font-semibold text-slate-700">แนวโน้มผลผลิต</span>
            </div>
            <Chart options={chartOptions} series={chartData} type="line" height={220} />
        </div>
    );
}

export default ModalChartComponent;
