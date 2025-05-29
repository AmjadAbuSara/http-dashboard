import React from "react";
import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer
} from "recharts";

export const AvailabilityGauge = ({ availability = 0 }) => {
  const gaugeValue = parseFloat(availability.toFixed(1)) || 0;

  const data = [
    { name: "value", value: gaugeValue },
    { name: "gap", value: 100 - gaugeValue }
  ];

  const getColor = (value) => {
    if (value >= 90) return "#4CAF50";  // green
    if (value >= 75) return "#FFC107";  // yellow
    if (value >= 50) return "#FF9800";  // orange
    return "#F44336";                   // red
  };

  const color = getColor(gaugeValue);

  return (
    <div className="bg-dashboard-card p-6 rounded-lg shadow-md">
      <h3 className="text-lg font-semibold mb-4 text-dashboard-accent">
        Availability (%)
      </h3>
      <div className="relative h-[220px]">
        <ResponsiveContainer width="100%" height="80%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="100%"
              startAngle={180}
              endAngle={0}
              innerRadius={70}
              outerRadius={90}
              dataKey="value"
              isAnimationActive={true}
            >
              <Cell fill={color} />
              <Cell fill="#2D3142" />
            </Pie>
          </PieChart>
        </ResponsiveContainer>

        {/* Centered % text */}
        <div className="absolute inset-0 flex items-end justify-center pb-12">
          <span className="text-3xl font-bold text-white">
            {gaugeValue}<span className="text-base font-semibold ml-1">%</span>
          </span>
        </div>
      </div>
    </div>
  );
};
