import React from 'react';

export const SimpleRecordingButton = ({ records, fileName = "recorded_data.json" }) => {
  const handleDownload = () => {
    if (!records || records.length === 0) {
      alert("No data to record.");
      return;
    }

    // Calculate analytical data
    const totalRecords = records.length;
    const totalResponseTime = records.reduce((sum, record) => sum + record.ResponseTime, 0);
    const averageResponseTime = totalRecords > 0 ? (totalResponseTime / totalRecords).toFixed(2) : 0;
    const successfulRecords = records.filter(record => record.Status < 400).length;
    const failedRecords = totalRecords - successfulRecords;

    const responseTimes = records.map(record => record.ResponseTime);
    const minResponseTime = responseTimes.length > 0 ? Math.min(...responseTimes) : 0;
    const maxResponseTime = responseTimes.length > 0 ? Math.max(...responseTimes) : 0;

    // Calculate Avg Req/Min
    let avgReqPerMin = 0;
    if (totalRecords > 1) {
      const firstTimestamp = new Date(records[0].Timestamp).getTime();
      const lastTimestamp = new Date(records[totalRecords - 1].Timestamp).getTime();
      const durationMinutes = (lastTimestamp - firstTimestamp) / (1000 * 60);
      if (durationMinutes > 0) {
        avgReqPerMin = (totalRecords / durationMinutes).toFixed(2);
      }
    }

    // Create a new array of records without the ParsedInfo field
    const recordsWithoutParsedInfo = records.map(({ ParsedInfo, ...rest }) => rest);

    const analyticalData = {
      summary: {
        totalRecords: totalRecords,
        averageResponseTime: parseFloat(averageResponseTime),
        minResponseTime: minResponseTime,
        maxResponseTime: maxResponseTime,
        successfulRecords: successfulRecords,
        failedRecords: failedRecords,
        avgRequestsPerMinute: parseFloat(avgReqPerMin),
      },
      rawRecords: recordsWithoutParsedInfo, // Use the new array without ParsedInfo
    };

    const dataStr = JSON.stringify(analyticalData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', fileName);
    document.body.appendChild(linkElement); // Required for Firefox
    linkElement.click();
    document.body.removeChild(linkElement);
  };

  return (
    <button 
      onClick={handleDownload}
      className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700"
    >
      Download Current Data
    </button>
  );
};