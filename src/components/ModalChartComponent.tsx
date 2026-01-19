import type { ApexOptions } from "apexcharts";
import Chart from "react-apexcharts";
import type { CropType } from "types";

type PropsType = {
    data: CropType[];
};

function ModalChartComponent({ data }: PropsType) {
    const categories = Array.from(
        new Set(
            data.flatMap((cropGroup) => cropGroup.data.map((item) => item.year))
        )
    ).sort((a, b) => a - b);

    const chartData = data.map((cropGroup) => ({
        name: cropGroup.name,
        data: categories.map((year) => {
            const yearlyRecord = cropGroup.data.find(
                (item) => item.year === year
            );

            return yearlyRecord ? yearlyRecord.yield_per_rai : 0;
        }),
    }));

    const chartOptions: ApexOptions = {
        chart: {
            toolbar: {
                show: false,
            },
            fontFamily: "Kanit"
        },
        dataLabels: {
            enabled: false,
        },
        grid: {
            row: {
                colors: ["#f3f3f3", "transparent"],
                opacity: 0.5,
            },
        },
        xaxis: {
            categories: categories.map(String),
        },
        tooltip: {
            enabled: false,
        },
    };

    return (
        <Chart
            options={chartOptions}
            series={chartData}
            type="line"
            height={250}
        />
    );
}

export default ModalChartComponent;
