import React, { useEffect, useRef, useState } from "react";
import { AvailabilityGauge } from "./components/availability-gauge";
import { MetricsPanel } from "./components/metrics-panel";
import { RecordsTable } from "./components/records-table";
import { ResponseTimeChart } from "./components/response-time-chart";
import { SimpleRecordingButton } from "./components/SimpleRecordingButton";
import { SuccessFailPie } from "./components/success-fail-pie";
import { useDashboardData } from "./hooks/use-dashboard-data";

const App = () => {
  const { data, isLoading } = useDashboardData();
  const [tutorialStep, setTutorialStep] = useState(0);
  const [isTutorialActive, setIsTutorialActive] = useState(false);
  const [selectedTimestamp, setSelectedTimestamp] = useState(null);
  const [selectedChart, setSelectedChart] = useState("recharts");
  const [showExpandedInfo, setShowExpandedInfo] = useState(false);

  const tableRef = useRef(null);
  const highlightTimerRef = useRef(null);
  const targetRefs = useRef([]);
  const popupRef = useRef(null);
  const mainContainerRef = useRef(null);

  const safeMetrics = {
    avg: Number(data?.metrics?.avg ?? 0),
    max: Number(data?.metrics?.max ?? 0),
    min: Number(data?.metrics?.min ?? 0),
    avg_req_per_min: Number(data?.metrics?.avg_req_per_min ?? 0),
    success: Number(data?.metrics?.success ?? 0),
    fail: Number(data?.metrics?.fail ?? 0)
  };

  const safeAvailability = Number(data?.availability ?? 0);
  const safeRecords = Array.isArray(data?.records) ? data.records : [];

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

  // Scroll to tutorial targets
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

  // Position tutorial popup
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

  // Scroll + highlight table row on chart click
  useEffect(() => {
    if (!selectedTimestamp || !tableRef.current) return;

    const ts = new Date(selectedTimestamp).getTime();
    const row = tableRef.current.querySelector(`[data-timestamp="${ts}"]`);

    if (row) {
      row.classList.remove("animate-pulse", "bg-blue-500", "bg-opacity-20");
      void row.offsetWidth; // Force reflow
      row.classList.add("animate-pulse", "bg-blue-500", "bg-opacity-20");

      row.scrollIntoView({ behavior: "smooth", block: "center" });

      clearTimeout(highlightTimerRef.current);
      highlightTimerRef.current = setTimeout(() => {
        row.classList.remove("animate-pulse", "bg-blue-500", "bg-opacity-20");
      }, 1500);
    }
  }, [selectedTimestamp]);

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
    <div ref={mainContainerRef} className="min-h-screen bg-dashboard-bg text-dashboard-text p-6 space-y-6 relative">
      {isTutorialActive && <div className="fixed inset-0 bg-black bg-opacity-70 z-40 pointer-events-none" />}

      <h1 className="text-3xl font-bold text-dashboard-accent">Real-Time HTTP Response Dashboard</h1>

      <div
        id="metrics-panel"
        ref={(el) => (targetRefs.current[0] = el)}
        className={`relative transition-all duration-300 ${isTutorialActive && tutorialStep === 0 ? "ring-4 ring-yellow-400 z-50" : isTutorialActive ? "opacity-50" : ""}`}
      >
        <MetricsPanel metrics={safeMetrics} isLoading={isLoading} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div
          id="availability-gauge"
          ref={(el) => (targetRefs.current[1] = el)}
          className={`bg-dashboard-card p-4 rounded-lg shadow-md transition-all duration-300 ${isTutorialActive && tutorialStep === 1 ? "ring-4 ring-yellow-400 z-50" : isTutorialActive ? "opacity-50" : ""}`}
        >
          <AvailabilityGauge availability={safeAvailability} />
        </div>

        <div
          id="success-fail-pie"
          ref={(el) => (targetRefs.current[2] = el)}
          className={`bg-dashboard-card p-4 rounded-lg shadow-md transition-all duration-300 ${isTutorialActive && tutorialStep === 2 ? "ring-4 ring-yellow-400 z-50" : isTutorialActive ? "opacity-50" : ""}`}
        >
          <SuccessFailPie success={safeMetrics.success} fail={safeMetrics.fail} />
        </div>
      </div>

      <div
        id="response-time-chart"
        ref={(el) => (targetRefs.current[3] = el)}
        className={`bg-dashboard-card p-4 rounded-lg shadow-md transition-all duration-300 ${isTutorialActive && tutorialStep === 3 ? "ring-4 ring-yellow-400 z-50" : isTutorialActive ? "opacity-50" : ""}`}
      >
        <ResponseTimeChart
          records={safeRecords}
          onPointClick={setSelectedTimestamp}
          onChartChange={setSelectedChart}
        />
        <div className="mt-4">
          <SimpleRecordingButton records={safeRecords} fileName={`response_times_${new Date().toISOString()}.json`} />
        </div>
      </div>

      <div
        id="records-table"
        ref={(el) => {
          targetRefs.current[4] = el;
          tableRef.current = el;
        }}
        className={`bg-dashboard-card p-4 rounded-lg shadow-md transition-all duration-300 ${isTutorialActive && tutorialStep === 4 ? "ring-4 ring-yellow-400 z-50" : isTutorialActive ? "opacity-50" : ""}`}
      >
        <RecordsTable records={safeRecords} selectedTimestamp={selectedTimestamp} />
      </div>

      {isTutorialActive && (
        <div ref={popupRef} className="fixed z-50 bg-white p-4 rounded-lg shadow-xl max-w-xs w-full border border-gray-200">
          <button onClick={closeTutorial} className="absolute top-2 right-2 text-gray-400 hover:text-gray-600">✕</button>
          <h3 className="font-bold text-lg mb-2 text-gray-800">{tutorialSteps[tutorialStep].title}</h3>
          <p className="mb-2 text-gray-700 whitespace-pre-line">{tutorialSteps[tutorialStep].content}</p>

          <button onClick={() => setShowExpandedInfo(!showExpandedInfo)} className="text-sm text-blue-600 hover:underline mb-3">
            {showExpandedInfo ? "Hide extra info" : "Show more info"}
          </button>

          {showExpandedInfo && (
            <p className="text-xs text-gray-600 whitespace-pre-line">{tutorialSteps[tutorialStep].expanded}</p>
          )}

          <div className="flex justify-between items-center mt-4">
            <button onClick={prevStep} disabled={tutorialStep === 0} className={`px-3 py-1 rounded ${tutorialStep === 0 ? "text-gray-400 cursor-default" : "text-blue-500 hover:bg-blue-50"}`}>
              ← Previous
            </button>
            <div className="text-sm text-gray-500">{tutorialStep + 1}/{tutorialSteps.length}</div>
            <button onClick={nextStep} className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600">
              {tutorialStep === tutorialSteps.length - 1 ? "Finish" : "Next →"}
            </button>
          </div>
        </div>
      )}

      {!isTutorialActive && (
        <button onClick={startTutorial} className="fixed bottom-4 right-4 bg-blue-500 text-white px-4 py-2 rounded-md shadow-lg hover:bg-blue-600 transition">
          Show Tutorial
        </button>
      )}
    </div>
  );
};

export default App;
