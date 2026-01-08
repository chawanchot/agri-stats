import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);

function ChartComponent() {
    const ChartOptions = {
        responsive: true,
        plugins: {
            legend: {
                position: "top" as const,
            },
            title: {
                display: true,
                text: "ผลผลิตรายปี",
            },
        },
    };

    const ChartLabels = ["2563", "2564", "2565", "2566", "2567"];
    return (
        <Line
            options={ChartOptions}
            data={{
                labels: ChartLabels,
                datasets: [
                    {
                        label: "ทุเรียน",
                        data: [202, 245, 275, 295, 325],
                        borderColor: "rgb(53, 162, 235)",
                        backgroundColor: "rgba(53, 162, 235, 0.5)",
                    },
                    {
                        label: "ยางพารา",
                        data: [252, 285, 300, 312, 335],
                        borderColor: "rgb(134, 140, 150)",
                        backgroundColor: "rgb(134, 140, 150, 0.5)",
                    },
                ],
            }}
        />
    );
}

export default ChartComponent;
