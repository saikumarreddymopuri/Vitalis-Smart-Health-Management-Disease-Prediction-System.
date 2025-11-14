import React from 'react';
import { Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

const RoleDoughnutChart = ({ chartData }) => {
  const data = {
    labels: chartData.map(d => d.role),
    datasets: [
      {
        label: '# of Users',
        data: chartData.map(d => d.count),
        backgroundColor: [
          '#3b82f6', // Neon Blue (User)
          '#ec4899', // Neon Pink (Operator)
          '#22c55e', // Neon Green (Admin)
        ],
        borderColor: '#1f2937', // Dark bg
        borderWidth: 3,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
        labels: {
          color: '#e5e7eb', // Light text
          font: {
            size: 14,
          },
        },
      },
      tooltip: {
        backgroundColor: '#111827',
        titleColor: '#e5e7eb',
        bodyColor: '#e5e7eb',
        borderColor: '#3b82f6',
        borderWidth: 1,
      },
    },
  };

  return <Doughnut data={data} options={options} />;
};

export default RoleDoughnutChart;