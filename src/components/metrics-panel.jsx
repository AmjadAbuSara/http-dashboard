import React from "react";
import { Icon } from "@iconify/react";

const MetricCard = ({ title, value, color, icon, unit = "" }) => {
  return (
    <div className="bg-dashboard-card rounded-lg shadow-md p-4 flex flex-col justify-between min-w-[160px]">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-gray-300">{title}</span>
        <Icon icon={icon} className="text-lg text-gray-400" />
      </div>
      <div className={`text-2xl font-bold ${color}`}>
        {value}
        {unit && <span className="text-sm ml-1">{unit}</span>}
      </div>
    </div>
  );
};

export const MetricsPanel = ({ metrics, isLoading }) => {
  const safe = metrics || {
    avg: 0,
    max: 0,
    min: 0,
    avg_req_per_min: 0,
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 w-full">
      <MetricCard
        title="Avg Response Time"
        value={safe.avg.toFixed(1)}
        color="text-green-500"
        icon="lucide:timer"
        unit="ms"
      />
      <MetricCard
        title="Max Response Time"
        value={safe.max.toFixed(1)}
        color="text-red-500"
        icon="lucide:arrow-up"
        unit="ms"
      />
      <MetricCard
        title="Min Response Time"
        value={safe.min.toFixed(1)}
        color="text-blue-500"
        icon="lucide:arrow-down"
        unit="ms"
      />
      <MetricCard
        title="Avg Req/Min"
        value={safe.avg_req_per_min.toFixed(2)}
        color="text-dashboard-accent"
        icon="lucide:activity"
      />
    </div>
  );
};
