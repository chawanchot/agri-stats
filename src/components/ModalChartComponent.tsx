import type { ApexOptions } from "apexcharts";
import Chart from "react-apexcharts";

type PropsType = {
    data: CropType[];
};

type CropType = {
    name: string;
    data: CropDetailType[];
};

type CropDetailType = {
    crop: string;
    harvest_area: number;
    planted_area: number;
    province: string;
    year: number;
    yield_per_rai: number;
    yield_ton: number;
};

function ModalChartComponent({ data }: PropsType) {
    console.log(data);

    const chartOptions: ApexOptions = {
        chart: {
            toolbar: {
                show: false,
            },
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
            categories: ["2563", "2564", "2565", "2566", "2567"],
        },
    }

    const chartData = [
        {
            name: "ทุเรียน",
            data: [202, 245, 275, 295, 325],
        },
        {
            name: "ยางพารา",
            data: [252, 285, 300, 312, 335],
        },
    ];

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
