import React, { useEffect, useRef, useState } from "react";
import { AvailabilityGauge } from "./components/availability-gauge";
import { MetricsPanel } from "./components/metrics-panel";
import { RecordsTable } from "./components/records-table";
import { ResponseTimeChart } from "./components/response-time-chart";
import { SimpleRecordingButton } from "./components/SimpleRecordingButton";
import { SuccessFailPie } from "./components/success-fail-pie";
import { PUBLIC_URL_ENDPOINT } from './config';
import { useDashboardData } from "./hooks/use-dashboard-data";
console.log("Backend base URL:", PUBLIC_URL_ENDPOINT);

const App = () => {
  const { data, isLoading } = useDashboardData();
  const [tutorialStep, setTutorialStep] = useState(0);
  const [isTutorialActive, setIsTutorialActive] = useState(false);
  const [selectedTimestamp, setSelectedTimestamp] = useState(null);
  const targetRefs = useRef([]);
  const popupRef = useRef(null);
  const mainContainerRef = useRef(null);

  const tutorialSteps = [
    { id: "metrics-panel", title: "Metrics Panel", content: "This shows key metrics like success/fail rates." },
    { id: "availability-gauge", title: "Availability Gauge", content: "This displays real-time availability percentage." },
    { id: "success-fail-pie", title: "Success/Fail Pie Chart", content: "Visualizes the ratio of successful vs. failed requests." },
    { id: "response-time-chart", title: "Response Time Chart", content: "Tracks how response times change over time." },
    { id: "records-table", title: "Records Table", content: "Lists all recorded HTTP responses with details." }
  ];

  useEffect(() => {
    if (isTutorialActive) {
      document.body.style.overflow = 'hidden';
      if (targetRefs.current[tutorialStep]) {
        targetRefs.current[tutorialStep].scrollIntoView({
          behavior: 'smooth',
          block: 'center'
        });
      }
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isTutorialActive, tutorialStep]);

  useEffect(() => {
    if (isTutorialActive && targetRefs.current[tutorialStep] && popupRef.current) {
      const targetRect = targetRefs.current[tutorialStep].getBoundingClientRect();
      const popupHeight = popupRef.current.offsetHeight;
      let topPosition = targetRect.bottom + 20;
      if (topPosition + popupHeight > window.innerHeight) {
        topPosition = targetRect.top - popupHeight - 20;
      }
      popupRef.current.style.top = `${topPosition}px`;
      popupRef.current.style.left = `${targetRect.left}px`;
    }
  }, [tutorialStep, isTutorialActive]);

  const startTutorial = () => {
    setIsTutorialActive(true);
    setTutorialStep(0);
  };

  const nextStep = () => {
    if (tutorialStep < tutorialSteps.length - 1) {
      setTutorialStep(tutorialStep + 1);
    } else {
      setIsTutorialActive(false);
    }
  };

  const prevStep = () => {
    if (tutorialStep > 0) {
      setTutorialStep(tutorialStep - 1);
    }
  };

  const closeTutorial = () => {
    setIsTutorialActive(false);
    setTutorialStep(0);
  };

  return (
    <div
      ref={mainContainerRef}
      className="min-h-screen bg-dashboard-bg text-dashboard-text p-6 space-y-6 relative"
      style={{ overflow: isTutorialActive ? 'hidden' : 'auto' }}
    >
      {isTutorialActive && (
        <div className="fixed inset-0 bg-black bg-opacity-70 z-40 pointer-events-none" />
      )}

      <h1 className="text-3xl font-bold text-dashboard-accent">Real-Time HTTP Response Dashboard</h1>

      {/* Metrics Panel */}
      <div
        id="metrics-panel"
        ref={(el) => (targetRefs.current[0] = el)}
        className={`relative transition-all duration-300 ${isTutorialActive && tutorialStep === 0 ? "ring-4 ring-yellow-400 z-50" : isTutorialActive ? "opacity-50" : ""}`}
      >
        <MetricsPanel metrics={data?.metrics} isLoading={isLoading} />
      </div>

      {/* 2-column section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div
          id="availability-gauge"
          ref={(el) => (targetRefs.current[1] = el)}
          className={`bg-dashboard-card p-4 rounded-lg shadow-md relative transition-all duration-300 ${isTutorialActive && tutorialStep === 1 ? "ring-4 ring-yellow-400 z-50" : isTutorialActive ? "opacity-50" : ""}`}
        >
          <AvailabilityGauge availability={data?.availability || 0} />
        </div>
        <div
          id="success-fail-pie"
          ref={(el) => (targetRefs.current[2] = el)}
          className={`bg-dashboard-card p-4 rounded-lg shadow-md relative transition-all duration-300 ${isTutorialActive && tutorialStep === 2 ? "ring-4 ring-yellow-400 z-50" : isTutorialActive ? "opacity-50" : ""}`}
        >
          <SuccessFailPie success={data?.metrics?.success || 0} fail={data?.metrics?.fail || 0} />
        </div>
      </div>

      {/* Response Time Chart */}
      <div
        id="response-time-chart"
        ref={(el) => (targetRefs.current[3] = el)}
        className={`bg-dashboard-card p-4 rounded-lg shadow-md relative transition-all duration-300 ${isTutorialActive && tutorialStep === 3 ? "ring-4 ring-yellow-400 z-50" : isTutorialActive ? "opacity-50" : ""}`}
      >
        <ResponseTimeChart
          records={data?.records || []}
          onPointClick={setSelectedTimestamp}
        />
        <div className="mt-4">
          <SimpleRecordingButton records={data?.records || []} fileName={`response_times_${new Date().toISOString()}.json`} />
        </div>
      </div>

      {/* Records Table */}
      <div
        id="records-table"
        ref={(el) => (targetRefs.current[4] = el)}
        className={`bg-dashboard-card p-4 rounded-lg shadow-md relative transition-all duration-300 ${isTutorialActive && tutorialStep === 4 ? "ring-4 ring-yellow-400 z-50" : isTutorialActive ? "opacity-50" : ""}`}
      >
        <RecordsTable
          records={data?.records || []}
          selectedTimestamp={selectedTimestamp}
        />
      </div>

      {/* Tutorial Popup */}
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
          <p className="mb-4 text-gray-600">{tutorialSteps[tutorialStep].content}</p>
          <div className="flex justify-between items-center">
            <button
              onClick={prevStep}
              disabled={tutorialStep === 0}
              className={`px-3 py-1 rounded ${tutorialStep === 0 ? 'text-gray-400 cursor-default' : 'text-blue-500 hover:bg-blue-50'}`}
            >
              ← Previous
            </button>
            <div className="text-sm text-gray-500">{tutorialStep + 1}/{tutorialSteps.length}</div>
            <button
              onClick={nextStep}
              className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              {tutorialStep === tutorialSteps.length - 1 ? 'Finish' : 'Next →'}
            </button>
          </div>
        </div>
      )}

      {/* Start Tutorial Button */}
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