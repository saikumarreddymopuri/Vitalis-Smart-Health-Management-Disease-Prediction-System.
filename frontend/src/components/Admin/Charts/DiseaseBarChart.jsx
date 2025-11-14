import React from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const DiseaseBarChart = ({ chartData }) => {
  const data = {
    labels: chartData.map(d => d.disease.charAt(0).toUpperCase() + d.disease.slice(1)), // Capitalize
    datasets: [
      {
        label: 'Total Predictions',
        data: chartData.map(d => d.count),
        backgroundColor: 'rgba(236, 72, 153, 0.6)', // Neon Pink with opacity
        borderColor: '#ec4899', // Solid Neon Pink
        borderWidth: 2,
        borderRadius: 5,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        ticks: { color: '#9ca3af' },
        grid: { color: '#374151' },
      },
      x: {
        ticks: { color: '#9ca3af' },
        grid: { color: '#374151' },
      },
    },
    plugins: {
      legend: {
        display: false, // No legend needed for one dataset
      },
      title: {
        display: true,
        text: 'Top 5 Predicted Diseases',
        color: '#e5e7eb',
        font: { size: 18 },
      },
      tooltip: {
        backgroundColor: '#111827',
        titleColor: '#e5e7eb',
        bodyColor: '#e5e7eb',
        borderColor: '#ec4899',
        borderWidth: 1,
      },
    },
  };

  return <Bar data={data} options={options} />;
};

export default DiseaseBarChart;