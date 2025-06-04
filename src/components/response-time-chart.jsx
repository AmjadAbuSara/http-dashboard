import PropTypes from "prop-types";
import React, { useState } from "react";
import ApexCharts from "react-apexcharts";
import Plot from "react-plotly.js";
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

export const ResponseTimeChart = ({ records, onPointClick, onChartChange,selectedTimestamp // 👈 Add this
}) => {
  const [selectedChart, setSelectedChart] = useState("recharts");
  const [viewRange, setViewRange] = useState(null);
  const [manualStart, setManualStart] = useState("");
  const [manualEnd, setManualEnd] = useState("");

  const getStatusColor = (status) => {
    if (status < 300) return "#4CAF50";
    if (status < 400) return "#FFC107";
    if (status < 500) return "#FF9800";
    return "#F44336";
  };

  // Enrich each record with timestamp (millis), fullTime string, and a statusColor
  const fullData = records
    .map((record) => ({
      ...record,
      timestamp: new Date(record.Timestamp).getTime(),
      fullTime: new Date(record.Timestamp).toLocaleString(),
      statusColor: getStatusColor(record.Status)
    }))
    .sort((a, b) => a.timestamp - b.timestamp);

  const filteredData = viewRange
    ? fullData.filter((d) => d.timestamp >= viewRange.start && d.timestamp <= viewRange.end)
    : fullData;

  const minTimestamp = fullData[0]?.timestamp || Date.now();
  const maxTimestamp = fullData[fullData.length - 1]?.timestamp || Date.now();
  const currentStart = viewRange?.start || minTimestamp;
  const currentEnd = viewRange?.end || maxTimestamp;
  const currentSpan = currentEnd - currentStart;

  // If time span < 24h, show hourly ticks
  const customTicks = [];
  if (currentSpan < 24 * 3600 * 1000) {
    for (let t = currentStart; t <= currentEnd; t += 60 * 60 * 1000) {
      customTicks.push(t);
    }
  }

  const formatDynamicDate = (value) => {
    const date = new Date(value);
    if (currentSpan < 60 * 1000) {
      return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        fractionalSecondDigits: 2
      });
    } else if (currentSpan < 3600 * 1000) {
      return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit"
      });
    } else if (currentSpan < 24 * 3600 * 1000) {
      return date.toLocaleString([], {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
        day: "2-digit",
        month: "short"
      });
    } else if (currentSpan < 90 * 24 * 3600 * 1000) {
      return date.toLocaleDateString([], { day: "2-digit", month: "short" });
    } else {
      return date.toLocaleDateString([], { month: "short", year: "numeric" });
    }
  };
  const MIN_ZOOM_SPAN = 5000;
  const zoomStep = 0.2;
  const zoom = (direction) => {
    const span = currentEnd - currentStart;
    const offset = span * zoomStep;
    const center = selectedTimestamp || (currentStart + currentEnd) / 2;
  
    if (direction === "in") {
      const newSpan = span - 2 * offset;
      if (newSpan < MIN_ZOOM_SPAN) return; // Stop zoom in
      setViewRange({
        start: Math.max(minTimestamp, center - newSpan / 2),
        end: Math.min(maxTimestamp, center + newSpan / 2),
      });
    } else {
      // Zoom out normally
      setViewRange({
        start: Math.max(minTimestamp, center - (span + offset) / 2),
        end: Math.min(maxTimestamp, center + (span + offset) / 2),
      });
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
          <p className="text-sm text-gray-300">Status: {data.Status}</p>
          <p className="text-sm text-gray-300">
            Response Time: {data.ResponseTime.toFixed(1)} ms
          </p>
        </div>
      );
    }
    return null;
  };

  // When user changes the dropdown, we both update local state and inform parent via onChartChange()
  const handleChartChange = (e) => {
    setSelectedChart(e.target.value);
    if (onChartChange) onChartChange(e.target.value);
  };

  return (
    <div>
      <h3 className="text-lg font-semibold mb-4 text-dashboard-accent">Response Times</h3>

      <div className="mb-4">
        <label className="mr-2 text-sm text-white">Chart Type:</label>
        <select
          className="px-2 py-1 rounded bg-gray-800 text-white border border-gray-600"
          value={selectedChart}
          onChange={handleChartChange}
        >
          <option value="recharts">Recharts</option>
          <option value="plotly">Plotly</option>
          <option value="apex">ApexCharts</option>
        </select>
      </div>

      {selectedChart === "recharts" && (
        <>
          <div className="mb-4 flex flex-wrap gap-2">
            <button
              className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded"
              onClick={() => zoom("in")}
            >
              Zoom In
            </button>
            <button
              className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded"
              onClick={() => zoom("out")}
            >
              Zoom Out
            </button>
            <button
              className="bg-gray-700 hover:bg-gray-800 text-white px-3 py-1 rounded"
              onClick={resetZoom}
            >
              Reset Zoom
            </button>
            <button
              className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded"
              onClick={() => filterRange(7)}
            >
              Last 7 Days
            </button>
            <button
              className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded"
              onClick={() => filterRange(30)}
            >
              Last 30 Days
            </button>
            <button
              className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded"
              onClick={() => filterRange(365)}
            >
              Last Year
            </button>
          </div>

          <div className="mb-4 flex gap-2 items-center">
            <label className="text-white">Start:</label>
            <input
              type="datetime-local"
              value={manualStart}
              onChange={(e) => setManualStart(e.target.value)}
              className="px-2 py-1 rounded text-white bg-[#1E1E2F] border border-gray-600"
            />
            <label className="text-white">End:</label>
            <input
              type="datetime-local"
              value={manualEnd}
              onChange={(e) => setManualEnd(e.target.value)}
              className="px-2 py-1 rounded text-white bg-[#1E1E2F] border border-gray-600"
            />
            <button
              className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded"
              onClick={handleZoomToRange}
            >
              Zoom to Range
            </button>
          </div>
        </>
      )}

      <div className="h-[420px]">
        {selectedChart === "recharts" && (
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
                tick={{ fill: "rgba(245, 246, 250, 0.8)" }}
                axisLine={{ stroke: "rgba(255,255,255,0.3)" }}
              />
              <YAxis
                dataKey="ResponseTime"
                unit=" ms"
                tick={{ fill: "rgba(245, 246, 250, 0.8)" }}
                axisLine={{ stroke: "rgba(255,255,255,0.3)" }}
              />
              <ZAxis range={[60, 60]} />
              <Tooltip content={<CustomTooltip />} />
              <Scatter
                data={filteredData}
                fill="#4F8EF7"
                line={{ stroke: "#4F8EF7", strokeWidth: 2 }}
                lineType="joint"
                onClick={(e) => {
                  const rawTimestamp = new Date(e.payload.Timestamp).getTime();
                  if (onPointClick) onPointClick(rawTimestamp);
                }}
                shape={(props) => {
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
                      style={{ cursor: "pointer" }}
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
                    value: "Avg",
                    position: "insideTopRight",
                    fill: "#FFD700"
                  }}
                />
              )}
            </ScatterChart>
          </ResponsiveContainer>
        )}

        {selectedChart === "plotly" && (
          <Plot
            data={[
              {
                x: fullData.map((d) => new Date(d.timestamp).toLocaleString()),
                y: fullData.map((d) => d.ResponseTime),
                type: "scatter",
                mode: "lines+markers",
                marker: { color: fullData.map((d) => d.statusColor) },
                text: fullData.map((d) => d.ParsedInfo),
                hoverinfo: "text+y"
              }
            ]}
            layout={{
              title: "Plotly Response Times",
              autosize: true,
              margin: { t: 50, b: 40 },
              paper_bgcolor: "#181B23",
              plot_bgcolor: "#181B23",
              font: { color: "#F5F6FA" }
            }}
            style={{ width: "100%", height: "100%", cursor: "pointer" }}
          />
        )}

        {selectedChart === "apex" && (
          <div style={{ cursor: "default", height: "100%" }}>
            <ApexCharts
              options={{
                chart: {
                  id: "apex-response-chart",
                  toolbar: { show: false },
                  zoom: { enabled: false },
                  background: "#181B23",
                  events: {
                    dataPointSelection: (event, chartContext, config) => {
                      const clicked = fullData[config.dataPointIndex];
                      const timestamp = new Date(clicked.Timestamp).getTime();
                      if (onPointClick) onPointClick(timestamp);
                    }
                  }
                },
                xaxis: {
                  type: "datetime",
                  labels: { style: { colors: "#F5F6FA" } }
                },
                yaxis: {
                  labels: { style: { colors: "#F5F6FA" } },
                  title: { text: "Response Time (ms)", style: { color: "#F5F6FA" } }
                },
                stroke: {
                  curve: "smooth",
                  width: 3
                },
                markers: {
                  size: 5,
                  colors: "#00BFFF",
                  strokeColor: "#181B23",
                  strokeWidth: 2,
                  hover: { sizeOffset: 2 }
                },
                tooltip: {
                  theme: "dark",
                  custom: ({ series, seriesIndex, dataPointIndex, w }) => {
                    const record = fullData[dataPointIndex];
                    return `
                      <div style="padding:6px;">
                        <div><strong>${record.fullTime}</strong></div>
                        <div>Status: ${record.Status}</div>
                        <div>Response Time: ${record.ResponseTime} ms</div>
                        <div style="margin-top:4px;">${record.ParsedInfo}</div>
                      </div>`;
                  }
                },
                theme: { mode: "dark" }
              }}
              series={[
                {
                  name: "Response Time",
                  data: fullData.map((d) => [d.timestamp, d.ResponseTime])
                }
              ]}
              type="line"
              height="100%"
              width="100%"
            />
          </div>
        )}
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
  onPointClick: PropTypes.func,
  onChartChange: PropTypes.func,
  selectedTimestamp: PropTypes.number
};
