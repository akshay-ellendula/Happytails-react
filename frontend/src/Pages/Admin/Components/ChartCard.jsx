import React from "react";
import { Line, Doughnut } from "react-chartjs-2";

import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
} from "chart.js";

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement
);

export default function ChartCard({
  title,
  chartData,
  chartOptions,
  type = "line",
}) {
  return (
    <div className="bg-white shadow-sm rounded-lg p-4">
      <h3 className="text-sm font-medium mb-3">{title}</h3>
      <div className="h-64">
        {type === "line" && <Line data={chartData} options={chartOptions} />}
        {type === "doughnut" && (
          <Doughnut data={chartData} options={chartOptions} />
        )}
      </div>
    </div>
  );
}
