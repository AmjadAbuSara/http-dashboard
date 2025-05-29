import React from "react";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";

export const SuccessFailPie = ({ success = 0, fail = 0 }) => {
  const data = [
    { name: "Success", value: success, color: "#4CAF50" },
    { name: "Fail", value: fail, color: "#F44336" },
  ];

  const COLORS = ["#4CAF50", "#F44336"];

  const isEmpty = success === 0 && fail === 0;
  const total = success + fail;
  const successPercentage = total > 0 ? ((success / total) * 100).toFixed(1) : 0;
  const failPercentage = total > 0 ? ((fail / total) * 100).toFixed(1) : 0;

  return (
    <div className="bg-dashboard-card rounded-lg p-4 shadow-md relative">
      <h3 className="text-lg font-semibold mb-4 text-dashboard-accent">Success vs Fail</h3>
      <div className="h-[220px]">
        {isEmpty ? (
          <div className="flex items-center justify-center h-full text-gray-400">
            No success/fail data available
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                innerRadius={50}
                outerRadius={80}
                dataKey="value"
                isAnimationActive={false}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>
      {!isEmpty && (
        <div className="absolute bottom-4 right-4 text-xs text-dashboard-secondary">
          <div className="flex items-center mb-1">
            <div className="w-3 h-3 bg-[#4CAF50] mr-2"></div>
            <span>Success: {successPercentage}%</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-[#F44336] mr-2"></div>
            <span>Fail: {failPercentage}%</span>
          </div>
        </div>
      )}
    </div>
  );
};
