import React from "react";
import { Line, Doughnut, Bar } from "react-chartjs-2";

import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
} from "chart.js";

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title
);

export default function ChartCard({
  title,
  subtitle,
  chartData,
  chartOptions,
  type = "line",
  className = "",
  actionButton
}) {
  const defaultOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          padding: 15,
          usePointStyle: true,
          font: {
            size: 12
          }
        }
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        titleColor: '#1f2937',
        bodyColor: '#4b5563',
        borderColor: '#e5e7eb',
        borderWidth: 1,
        cornerRadius: 8,
        padding: 12,
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      }
    },
    scales: type === 'line' || type === 'bar' ? {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
        },
        ticks: {
          padding: 10,
        }
      },
      x: {
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
        },
        ticks: {
          padding: 10,
        }
      }
    } : {},
  };

  const mergedOptions = { ...defaultOptions, ...chartOptions };

  return (
    <div className={`bg-white rounded-2xl shadow-lg overflow-hidden hover-lift transition-all duration-300 ${className}`}>
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h3 className="text-xl font-bold text-gray-800">{title}</h3>
            {subtitle && <p className="text-gray-500 text-sm mt-1">{subtitle}</p>}
          </div>
          {actionButton && <div>{actionButton}</div>}
        </div>
        
        {/* Chart type selector */}
        <div className="flex space-x-2 mt-4 hidden">
          {['line', 'bar', 'doughnut'].map((chartType) => (
            <button
              key={chartType}
              className={`px-3 py-1 rounded-lg text-sm font-medium capitalize ${
                type === chartType 
                  ? 'bg-yellow-500 text-white' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {chartType}
            </button>
          ))}
        </div>
      </div>
      
      <div className="p-4">
        <div className="h-72 relative">
          {type === "line" && <Line data={chartData} options={mergedOptions} />}
          {type === "doughnut" && <Doughnut data={chartData} options={mergedOptions} />}
          {type === "bar" && <Bar data={chartData} options={mergedOptions} />}
          
          {/* Chart overlay info */}
          {chartData && (
            <div className="absolute top-4 right-4 bg-white/80 backdrop-blur-sm p-2 rounded-lg shadow-sm">
              <div className="text-xs text-gray-500">Last Updated</div>
              <div className="text-sm font-medium">Just now</div>
            </div>
          )}
        </div>
      </div>
      
      {/* Chart footer */}
      <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-4">
            {chartData?.datasets?.map((dataset, idx) => (
              <div key={idx} className="flex items-center">
                <div 
                  className="w-3 h-3 rounded-full mr-2" 
                  style={{ backgroundColor: dataset.borderColor || dataset.backgroundColor }}
                ></div>
                <span className="text-gray-600">{dataset.label}</span>
              </div>
            ))}
          </div>
          <button className="text-yellow-600 hover:text-yellow-700 text-sm font-medium flex items-center">
            <span>Download Report</span>
            <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}