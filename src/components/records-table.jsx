import {
  Card,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow
} from "@heroui/react";
import PropTypes from "prop-types";
import React, { useEffect, useRef, useState } from "react";

export const RecordsTable = ({ records, selectedTimestamp }) => {
  const formatDate = (timestamp) => {
    try {
      const date = new Date(timestamp);
      return date.toLocaleString();
    } catch (e) {
      return timestamp;
    }
  };

  const getStatusColor = (status) => {
    if (status < 300) return "text-green-400";
    if (status < 400) return "text-yellow-400";
    if (status < 500) return "text-orange-400";
    return "text-red-400";
  };

  const safeRecords = Array.isArray(records) ? records : [];
  const tableBodyRef = useRef(null);
  const [highlightedTimestamp, setHighlightedTimestamp] = useState(null);

  const normalizedSelected = selectedTimestamp
    ? new Date(selectedTimestamp).getTime()
    : null;

  // Auto-scroll & animate row
  useEffect(() => {
    if (!normalizedSelected || !tableBodyRef.current) return;

    const timeout = setTimeout(() => {
      const selectedRow = tableBodyRef.current.querySelector(
        `[data-timestamp="${normalizedSelected}"]`
      );
      if (selectedRow) {
        selectedRow.scrollIntoView({ behavior: "smooth", block: "center" });
        setHighlightedTimestamp(normalizedSelected);

        // Remove highlight after a while
        setTimeout(() => setHighlightedTimestamp(null), 1500);
      }
    }, 100);

    return () => clearTimeout(timeout);
  }, [normalizedSelected, records]);

  return (
    <Card className="bg-dashboard-card border-none shadow-md p-6">
      <h3 className="text-lg font-semibold mb-4 text-dashboard-accent">Raw Records</h3>
      <Table
        aria-label="HTTP request records"
        removeWrapper
        classNames={{
          th: "bg-[#1E2130] text-gray-300 font-medium",
          td: "border-t border-gray-800"
        }}
      >
        <TableHeader>
          <TableColumn>Timestamp</TableColumn>
          <TableColumn>Status</TableColumn>
          <TableColumn>Response Time</TableColumn>
          <TableColumn>Parsed Info</TableColumn>
        </TableHeader>
        <TableBody ref={tableBodyRef}>
          {safeRecords.length > 0 ? (
            [...safeRecords].reverse().map((record, index) => {
              const normalized = new Date(record.Timestamp).getTime();
              const isSelected = normalized === normalizedSelected;

              return (
                <TableRow
                  key={record.Timestamp + index}
                  data-timestamp={normalized}
                  className={`transition duration-300 ease-in-out
                    ${index % 2 === 0 ? "bg-[#1E2130]" : "bg-[#23263A]"}
                    ${isSelected ? "bg-blue-500 bg-opacity-20" : ""}
                    ${highlightedTimestamp === normalized ? "animate-pulse" : ""}
                  `}
                >
                  <TableCell className="text-gray-300">{formatDate(record.Timestamp)}</TableCell>
                  <TableCell>
                    <span className={getStatusColor(record.Status)}>
                      {record.Status}
                    </span>
                  </TableCell>
                  <TableCell className="text-gray-300">
                    {record.ResponseTime} ms
                  </TableCell>
                  <TableCell className="text-gray-300">
                    <div dangerouslySetInnerHTML={{ __html: record.ParsedInfo }} />
                  </TableCell>
                </TableRow>
              );
            })
          ) : (
            <TableRow>
              <TableCell colSpan={4} className="text-center py-8 text-gray-400">
                No records available
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </Card>
  );
};

RecordsTable.propTypes = {
  records: PropTypes.arrayOf(
    PropTypes.shape({
      Timestamp: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      Status: PropTypes.number,
      ResponseTime: PropTypes.number,
      ParsedInfo: PropTypes.string
    })
  ),
  selectedTimestamp: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
};
