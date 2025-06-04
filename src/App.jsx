// src/App.jsx
import React, { useEffect, useRef, useState } from "react";
import { AvailabilityGauge } from "./components/availability-gauge";
import { MetricsPanel } from "./components/metrics-panel";
import { RecordsTable } from "./components/records-table";
import { ResponseTimeChart } from "./components/response-time-chart";
import { SimpleRecordingButton } from "./components/SimpleRecordingButton";
import { SuccessFailPie } from "./components/success-fail-pie";
import { useDashboardData } from "./hooks/use-dashboard-data";

const App = () => {
  // 1) Pull data & isLoading from backend via your hook:
  const { data, isLoading } = useDashboardData();

  // 2) Tutorial‐related state (unchanged):
  const [tutorialStep, setTutorialStep] = useState(0);
  const [isTutorialActive, setIsTutorialActive] = useState(false);
  const [selectedTimestamp, setSelectedTimestamp] = useState(null);
  const [selectedChart, setSelectedChart] = useState("recharts");
  const [showExpandedInfo, setShowExpandedInfo] = useState(false);

  // 3) Refs for scrolling/highlighting:
  const tableRef = useRef(null);
  const highlightTimerRef = useRef(null);
  const targetRefs = useRef([]);
  const popupRef = useRef(null);
  const mainContainerRef = useRef(null);

  // 4) Safely extract the raw records array from `data` (or empty array if not yet loaded)
  const safeRecords = [...(Array.isArray(data?.records) ? data.records : [])].sort(
    (a, b) => new Date(a.Timestamp) - new Date(b.Timestamp)
  );
  // 5) Compute “Avg Req/Min” on the front‐end exactly as in SimpleRecordingButton:
  let computedReqPerMin = 0;
  if (safeRecords.length > 1) {
    // Records arrive sorted by timestamp ascending or descending?
    // We assume `safeRecords` is in chronological order; if backend returns newest‐first,
    // we should sort ascending. But here we’ll assume it’s already oldest→newest.
    const firstTs = new Date(safeRecords[0].Timestamp).getTime();
    const lastTs = new Date(safeRecords[safeRecords.length - 1].Timestamp).getTime();
    const durationMinutes = (lastTs - firstTs) / (1000 * 60);
    if (durationMinutes > 0) {
      computedReqPerMin = safeRecords.length / durationMinutes;
    }
  }

  // 6) Pull the other metrics (avg/min/max/success/fail) from the backend:
  const metricsFromAPI = data?.metrics || {};
  const safeMetrics = {
    avg:        Number(metricsFromAPI.avg  ?? 0),
    max:        Number(metricsFromAPI.max  ?? 0),
    min:        Number(metricsFromAPI.min  ?? 0),
    // Use our front‐end computed value instead of backend’s req_per_min:
    req_per_min: computedReqPerMin,
    success:    Number(metricsFromAPI.success ?? 0),
    fail:       Number(metricsFromAPI.fail ?? 0),
  };

  // 7) “Safe availability” from backend:
  const safeAvailability = Number(data?.availability ?? 0);

  // 8) Tutorial steps data (unchanged from your version):
  const tutorialSteps = [
    {
      id: "metrics-panel",
      title: "Metrics Panel",
      content: "Displays key request metrics like response times and request rate.",
      expanded: "• Avg / Max / Min Response Time\n• Avg Requests per Minute\n• Auto-refreshing every 5 seconds."
    },
    {
      id: "availability-gauge",
      title: "Availability Gauge",
      content: "Shows percentage of successful requests.",
      expanded: "• Green: Success\n• Red: Failures\n• Real-time availability gauge"
    },
    {
      id: "success-fail-pie",
      title: "Success/Fail Pie Chart",
      content: "Shows proportion of successful vs. failed requests.",
      expanded: "• Helps visualize system stability\n• Based on latest dataset"
    },
    {
      id: "response-time-chart",
      title: "Response Time Chart",
      content: "Tracks how request latency changes over time.",
      expanded:
        selectedChart === "recharts"
          ? "• Zoom In/Out, Reset, Date Range\n• Custom Start/End filtering\n• Click point to highlight record"
          : selectedChart === "plotly"
          ? "• Interactive with mouse pan/hover\n• No zoom or filter support\n• Great for trend spotting"
          : "• Visual with clean line plot\n• Visible data points\n• No zoom or filtering"
    },
    {
      id: "records-table",
      title: "Records Table",
      content: "Lists raw HTTP records in detail.",
      expanded: "• Sorted by time\n• Highlights selected timestamp\n• Scrolls to point-clicked record"
    }
  ];

  /*** Tutorial‐related Effects ***/
  // (A) Scroll to each tutorial target when activated
  useEffect(() => {
    if (isTutorialActive) {
      const scrollToTarget = () => {
        const el = targetRefs.current[tutorialStep];
        if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
      };
      scrollToTarget();
      setTimeout(scrollToTarget, 200);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isTutorialActive, tutorialStep]);

  // (B) Position the tutorial popup next to the highlighted element
  useEffect(() => {
    if (!isTutorialActive || !popupRef.current || !targetRefs.current[tutorialStep]) return;
    const timer = setTimeout(() => {
      const targetRect = targetRefs.current[tutorialStep].getBoundingClientRect();
      const popupHeight = popupRef.current.offsetHeight;
      let topPosition = targetRect.bottom + 20;
      if (topPosition + popupHeight > window.innerHeight) {
        topPosition = targetRect.top - popupHeight - 20;
      }
      popupRef.current.style.top = `${topPosition}px`;
      popupRef.current.style.left = `${targetRect.left}px`;
    }, 200);
    return () => clearTimeout(timer);
  }, [tutorialStep, isTutorialActive, selectedChart]);

  // (C) When the chart is clicked, highlight/scroll the corresponding row in the table:
  useEffect(() => {
    if (!selectedTimestamp || !tableRef.current) return;
    const ts = new Date(selectedTimestamp).getTime();
    const row = tableRef.current.querySelector(`[data-timestamp="${ts}"]`);
    if (row) {
      // Remove old pulse classes (if any) and force reflow
      row.classList.remove("animate-pulse", "bg-blue-500", "bg-opacity-20");
      void row.offsetWidth;
      // Add new pulse/highlight classes
      row.classList.add("animate-pulse", "bg-blue-500", "bg-opacity-20");
      row.scrollIntoView({ behavior: "smooth", block: "center" });
      clearTimeout(highlightTimerRef.current);
      highlightTimerRef.current = setTimeout(() => {
        row.classList.remove("animate-pulse", "bg-blue-500", "bg-opacity-20");
      }, 1500);
    }
  }, [selectedTimestamp]);

  // 9) Tutorial control functions
  const startTutorial = () => {
    setTutorialStep(0);
    setIsTutorialActive(true);
    setShowExpandedInfo(false);
  };
  const nextStep = () => {
    if (tutorialStep === tutorialSteps.length - 1) {
      closeTutorial();
    } else {
      setTutorialStep((prev) => prev + 1);
      setShowExpandedInfo(false);
    }
  };
  const prevStep = () => {
    setTutorialStep((prev) => Math.max(prev - 1, 0));
    setShowExpandedInfo(false);
  };
  const closeTutorial = () => {
    setIsTutorialActive(false);
    setTutorialStep(0);
    setShowExpandedInfo(false);
  };

  return (
    <div
      ref={mainContainerRef}
      className="min-h-screen bg-dashboard-bg text-dashboard-text p-6 space-y-6 relative"
    >
      {isTutorialActive && (
        // an overlay behind popups
        <div className="fixed inset-0 bg-black bg-opacity-70 z-40 pointer-events-none" />
      )}

      <h1 className="text-3xl font-bold text-dashboard-accent">
        Real-Time HTTP Response Dashboard
      </h1>

      {/* — Metrics Panel — */}
      <div
        id="metrics-panel"
        ref={(el) => (targetRefs.current[0] = el)}
        className={`relative transition-all duration-300 ${
          isTutorialActive && tutorialStep === 0
            ? "ring-4 ring-yellow-400 z-50"
            : isTutorialActive
            ? "opacity-50"
            : ""
        }`}
      >
        <MetricsPanel metrics={safeMetrics} />
      </div>

      {/* — Availability & Success/Fail — */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div
          id="availability-gauge"
          ref={(el) => (targetRefs.current[1] = el)}
          className={`bg-dashboard-card p-4 rounded-lg shadow-md transition-all duration-300 ${
            isTutorialActive && tutorialStep === 1
              ? "ring-4 ring-yellow-400 z-50"
              : isTutorialActive
              ? "opacity-50"
              : ""
          }`}
        >
          <AvailabilityGauge availability={safeAvailability} />
        </div>
        <div
          id="success-fail-pie"
          ref={(el) => (targetRefs.current[2] = el)}
          className={`bg-dashboard-card p-4 rounded-lg shadow-md transition-all duration-300 ${
            isTutorialActive && tutorialStep === 2
              ? "ring-4 ring-yellow-400 z-50"
              : isTutorialActive
              ? "opacity-50"
              : ""
          }`}
        >
          <SuccessFailPie
            success={safeMetrics.success}
            fail={safeMetrics.fail}
          />
        </div>
      </div>

      {/* — Response Time Chart — */}
      <div
        id="response-time-chart"
        ref={(el) => (targetRefs.current[3] = el)}
        className={`bg-dashboard-card p-4 rounded-lg shadow-md transition-all duration-300 ${
          isTutorialActive && tutorialStep === 3
            ? "ring-4 ring-yellow-400 z-50"
            : isTutorialActive
            ? "opacity-50"
            : ""
        }`}
      >
        <ResponseTimeChart
          records={safeRecords}
          onPointClick={setSelectedTimestamp}
          onChartChange={setSelectedChart}
          selectedTimestamp={selectedTimestamp}
        />
        <div className="mt-4">
          <SimpleRecordingButton
            records={safeRecords}
            fileName={`response_times_${new Date().toISOString()}.json`}
          />
        </div>
      </div>

      {/* — Records Table — */}
      <div
        id="records-table"
        ref={(el) => {
          targetRefs.current[4] = el;
          tableRef.current = el;
        }}
        className={`bg-dashboard-card p-4 rounded-lg shadow-md transition-all duration-300 ${
          isTutorialActive && tutorialStep === 4
            ? "ring-4 ring-yellow-400 z-50"
            : isTutorialActive
            ? "opacity-50"
            : ""
        }`}
      >
        <RecordsTable
          records={safeRecords}
          selectedTimestamp={selectedTimestamp}
        />
      </div>

      {/* — Tutorial Popup — */}
      {isTutorialActive && (
        <div
          ref={popupRef}
          className="fixed z-50 bg-white p-4 rounded-lg shadow-xl max-w-xs w-full border border-gray-200"
        >
          <button
            onClick={closeTutorial}
            className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
          <h3 className="font-bold text-lg mb-2 text-gray-800">
            {tutorialSteps[tutorialStep].title}
          </h3>
          <p className="mb-2 text-gray-700 whitespace-pre-line">
            {tutorialSteps[tutorialStep].content}
          </p>
          <button
            onClick={() => setShowExpandedInfo(!showExpandedInfo)}
            className="text-sm text-blue-600 hover:underline mb-3"
          >
            {showExpandedInfo ? "Hide extra info" : "Show more info"}
          </button>
          {showExpandedInfo && (
            <p className="text-xs text-gray-600 whitespace-pre-line">
              {tutorialSteps[tutorialStep].expanded}
            </p>
          )}
          <div className="flex justify-between items-center mt-4">
            <button
              onClick={prevStep}
              disabled={tutorialStep === 0}
              className={`px-3 py-1 rounded ${
                tutorialStep === 0
                  ? "text-gray-400 cursor-default"
                  : "text-blue-500 hover:bg-blue-50"
              }`}
            >
              ← Previous
            </button>
            <div className="text-sm text-gray-500">
              {tutorialStep + 1}/{tutorialSteps.length}
            </div>
            <button
              onClick={nextStep}
              className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              {tutorialStep === tutorialSteps.length - 1
                ? "Finish"
                : "Next →"}
            </button>
          </div>
        </div>
      )}

      {/* — “Show Tutorial” Button — */}
      {!isTutorialActive && (
        <button
          onClick={startTutorial}
          className="fixed bottom-4 right-4 bg-blue-500 text-white px-4 py-2 rounded-md shadow-lg hover:bg-blue-600 transition"
        >
          Show Tutorial
        </button>
      )}
    </div>
  );
};

export default App;
