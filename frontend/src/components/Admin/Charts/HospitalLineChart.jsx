import React from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler, // --- Make sure to import Filler for the gradient ---
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler // --- Register Filler ---
);

// Helper to get last 7 days as labels
const getLast7Days = () => {
  const days = [];
  // Loop from 6 (6 days ago) down to 0 (today)
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    // Format as "Nov 13"
    days.push(d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
  }
  return days;
};

// Helper function to create a gradient fill
const createGradient = (ctx, area) => {
  const gradient = ctx.createLinearGradient(0, area.bottom, 0, area.top);
  gradient.addColorStop(0, 'rgba(59, 130, 246, 0)'); // Transparent blue at bottom
  gradient.addColorStop(1, 'rgba(59, 130, 246, 0.5)'); // Solid blue at top
  return gradient;
};

const HospitalLineChart = ({ chartData }) => {
  const labels = getLast7Days();
  const hospitalNames = chartData.names;
  const trends = chartData.trends;

  // Our futuristic VITALIS colors
  const colors = [
    '#06b6d4', // Cyan
    '#ec4899', // Pink
    '#22c55e', // Green
    '#a855f7', // Purple
    '#eab308', // Yellow
  ];

  const datasets = Object.keys(hospitalNames).map((hospitalId, index) => {
    const color = colors[index % colors.length];
    
    // Create an array of 0s for the 7 days
    const dataPoints = new Array(7).fill(0);

    // Find all trends for this specific hospital
    const hospitalTrends = trends.filter(
      (t) => t._id.hospital === hospitalId
    );

    // Fill in the data
    labels.forEach((label, i) => {
      // Find a trend entry for this date
      // We must re-format the date from the DB to match the label
      const trendForDay = hospitalTrends.find(
        (t) => new Date(t._id.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) === label
      );
      if (trendForDay) {
        dataPoints[i] = trendForDay.count;
      }
    });

    return {
      label: hospitalNames[hospitalId],
      data: dataPoints,
      borderColor: color,
      // --- This creates the gradient fill under the line ---
      backgroundColor: (context) => {
        const { chart } = context;
        const { ctx, chartArea } = chart;
        if (!chartArea) {
          // This case happens on initial render
          return 'transparent';
        }
        // Create a custom gradient
        const gradient = ctx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top);
        gradient.addColorStop(0, `${color}00`); // Transparent at bottom
        gradient.addColorStop(1, `${color}55`); // 33% opacity at top
        return gradient;
      },
      // ---
      fill: true,
      tension: 0.3, // Makes the line curved
      pointBackgroundColor: color,
      pointBorderColor: '#fff',
      pointHoverRadius: 7,
      pointHoverBorderWidth: 2,
    };
  });

  const data = {
    labels,
    datasets,
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false, // Allows us to set custom height in Tailwind
    scales: {
      y: {
        beginAtZero: true,
        ticks: { 
          color: '#9ca3af', // Light gray text for Y-axis
          stepSize: 1, // Only show whole numbers (1, 2, 3)
        },
        grid: { color: '#374151' }, // Dark grid lines
      },
      x: {
        ticks: { color: '#9ca3af' }, // Light gray text for X-axis
        grid: { color: '#374151' }, // Dark grid lines
      },
    },
    plugins: {
      legend: {
        position: 'bottom', // Put legend at the bottom
        labels: { 
          color: '#e5e7eb', // Light text
          padding: 20,
          font: {
            size: 14,
          }
        },
      },
      title: {
        display: true,
        text: 'Top 5 Hospital Bookings (Last 7 Days)',
        color: '#e5e7eb',
        font: { size: 18, weight: 'bold' },
        padding: {
          bottom: 20,
        }
      },
      tooltip: {
        backgroundColor: '#111827', // Dark tooltip
        titleColor: '#e5e7eb',
        bodyColor: '#e5e7eb',
        borderColor: '#374151',
        borderWidth: 1,
        padding: 10,
        callbacks: {
          label: function(context) {
            return `${context.dataset.label}: ${context.parsed.y} bookings`;
          }
        }
      },
    },
    interaction: {
      mode: 'index',
      intersect: false,
    },
  };

  return <Line data={data} options={options} />;
};

export default HospitalLineChart;