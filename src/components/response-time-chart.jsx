
import PropTypes from "prop-types";
import React, { useState } from "react";
import {
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
  ZAxis
} from "recharts";

export const ResponseTimeChart = ({ records, onPointClick }) => {
  const [viewRange, setViewRange] = useState(null);
  const [manualStart, setManualStart] = useState("");
  const [manualEnd, setManualEnd] = useState("");

  const getStatusColor = (status) => {
    if (status < 300) return "#4CAF50";
    if (status < 400) return "#FFC107";
    if (status < 500) return "#FF9800";
    return "#F44336";
  };

  const fullData = records.map(record => ({
    ...record,
    timestamp: new Date(record.Timestamp).getTime(),
    fullTime: new Date(record.Timestamp).toLocaleString(),
    statusColor: getStatusColor(record.Status)
  })).sort((a, b) => a.timestamp - b.timestamp);

  const filteredData = viewRange
    ? fullData.filter(d => d.timestamp >= viewRange.start && d.timestamp <= viewRange.end)
    : fullData;

  const minTimestamp = fullData[0]?.timestamp || Date.now();
  const maxTimestamp = fullData[fullData.length - 1]?.timestamp || Date.now();
  const currentStart = viewRange?.start || minTimestamp;
  const currentEnd = viewRange?.end || maxTimestamp;
  const currentSpan = currentEnd - currentStart;

const customTicks = [];
if (currentSpan < 24 * 3600 * 1000) {
  for (let t = currentStart; t <= currentEnd; t += 60 * 60 * 1000) {
    customTicks.push(t);
}
}


  
// This version only updates the formatDynamicDate function


const formatDynamicDate = (value) => {
  const date = new Date(value);
  const span = currentEnd - currentStart;

  if (span < 60 * 1000) {
    return date.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      fractionalSecondDigits: 2
    });
  } else if (span < 3600 * 1000) {
    return date.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  } else if (span < 24 * 3600 * 1000) {
    return date.toLocaleString([], {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
      day: '2-digit',
      month: 'short'
    });
  } else if (span < 90 * 24 * 3600 * 1000) {
    return date.toLocaleDateString([], { day: '2-digit', month: 'short' });
  } else {
    return date.toLocaleDateString([], { month: 'short', year: 'numeric' });
  }
};



  const zoomStep = 0.2;

  const zoom = (direction) => {
    const span = currentEnd - currentStart;
    const offset = span * zoomStep;
    const center = (currentStart + currentEnd) / 2;
    if (direction === "in") {
      const newStart = Math.max(minTimestamp, center - span / 2 + offset);
      const newEnd = Math.min(maxTimestamp, center + span / 2 - offset);
      setViewRange({ start: newStart, end: newEnd });
    } else {
      const newStart = Math.max(minTimestamp, center - span / 2 - offset);
      const newEnd = Math.min(maxTimestamp, center + span / 2 + offset);
      setViewRange({ start: newStart, end: newEnd });
    }
  };

  const filterRange = (days) => {
    const end = maxTimestamp;
    const start = end - days * 24 * 60 * 60 * 1000;
    setViewRange({ start, end });
  };

  const resetZoom = () => setViewRange(null);

  const handleZoomToRange = () => {
    const start = new Date(manualStart).getTime();
    const end = new Date(manualEnd).getTime();
    if (!isNaN(start) && !isNaN(end) && start < end) {
      setViewRange({ start, end });
    }
  };

  const avgResponseTime =
    filteredData.reduce((sum, record) => sum + record.ResponseTime, 0) / (filteredData.length || 1);

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      
return (
        <div className="bg-[#2D3142] p-3 border border-gray-700 rounded-lg shadow-lg">
          <p className="font-medium text-white">{data.fullTime}</p>
          <p className="text-sm text-gray-300">
            <span className="font-medium">Status:</span> {data.Status}
          </p>
          <p className="text-sm text-gray-300">
            <span className="font-medium">Response Time:</span> {data.ResponseTime.toFixed(1)} ms
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div>
      <h3 className="text-lg font-semibold mb-4 text-dashboard-accent">Response Times</h3>

      <div className="mb-4 flex flex-wrap gap-2">
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded" onClick={() => zoom("in")}>Zoom In</button>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded" onClick={() => zoom("out")}>Zoom Out</button>
        <button className="bg-gray-700 hover:bg-gray-800 text-white px-3 py-1 rounded" onClick={resetZoom}>Reset Zoom</button>
        <button className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded" onClick={() => filterRange(7)}>Last 7 Days</button>
        <button className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded" onClick={() => filterRange(30)}>Last 30 Days</button>
        <button className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded" onClick={() => filterRange(365)}>Last Year</button>
      </div>

      <div className="mb-4 flex gap-2 items-center">
        <label className="text-white">Start:</label>
        <input type="datetime-local" value={manualStart} onChange={(e) => setManualStart(e.target.value)} className="px-2 py-1 rounded text-white bg-[#1E1E2F] border border-gray-600" />
        <label className="text-white">End:</label>
        <input type="datetime-local" value={manualEnd} onChange={(e) => setManualEnd(e.target.value)} className="px-2 py-1 rounded text-white bg-[#1E1E2F] border border-gray-600" />
        <button className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded" onClick={handleZoomToRange}>Zoom to Range</button>
      </div>

      <div className="h-[420px]">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 10, right: 30, left: 0, bottom: 30 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis
              dataKey="timestamp"
              type="number"
              scale="time"
              domain={["auto", "auto"]}
              tickFormatter={formatDynamicDate}
              tickCount={10}
              ticks={customTicks}
              tick={{ fill: 'rgba(245, 246, 250, 0.8)' }}
              axisLine={{ stroke: 'rgba(255,255,255,0.3)' }}
            />
            <YAxis
              dataKey="ResponseTime"
              name="Response Time"
              unit=" ms"
              tick={{ fill: 'rgba(245, 246, 250, 0.8)' }}
              axisLine={{ stroke: 'rgba(255,255,255,0.3)' }}
            />
            <ZAxis range={[60, 60]} />
            <Tooltip content={<CustomTooltip />} />
            <Scatter
              name="Response Time"
              data={filteredData}
              fill="#4F8EF7"
              line={{ stroke: '#4F8EF7', strokeWidth: 2 }}
              lineType="joint"
              onClick={(e) => {
                const rawTimestamp = new Date(e.payload.Timestamp).getTime();
                if (onPointClick) onPointClick(rawTimestamp);
              }}              shape={(props) => {
                const { cx, cy, fill } = props;
                const { statusColor } = props.payload;
                return (
                  <circle
                    cx={cx}
                    cy={cy}
                    r={6}
                    stroke="#181B23"
                    strokeWidth={2}
                    fill={statusColor || fill}
                  />
                );
              }}
            />
            {filteredData.length > 0 && (
              <ReferenceLine
                y={avgResponseTime}
                stroke="#FFD700"
                strokeDasharray="3 3"
                label={{
                  value: 'Avg',
                  position: 'insideTopRight',
                  fill: '#FFD700'
                }}
              />
            )}
          </ScatterChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

ResponseTimeChart.propTypes = {
  records: PropTypes.arrayOf(
    PropTypes.shape({
      Timestamp: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      Status: PropTypes.number,
      ResponseTime: PropTypes.number,
      ParsedInfo: PropTypes.string
    })
  ),
  onPointClick: PropTypes.func
};
