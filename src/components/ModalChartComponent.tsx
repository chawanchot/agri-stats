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

  const categories = Array.from(
    new Set(
      data.flatMap((cropGroup) => cropGroup.data.map((item) => item.year))
    )
  ).sort((a, b) => a - b);

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
      enabled: false
    },
  };

  return (
    <Chart options={chartOptions} series={chartData} type="line" height={250} />
  );
}

export default ModalChartComponent;
