import React, { useContext } from 'react';
import { ReportsContext } from '../context/userContext';
import NavBar from './NavBar';

const Report = () => {
  let { reports } = useContext(ReportsContext);

  if (!reports) {
    return (
      <div className="p-5">
        <NavBar />
        <p className="text-red-500">Loading reports...</p>
      </div>
    );
  }

  // If reports is a string, attempt to clean and parse it
  if (typeof reports === 'string') {
    try {
      const cleanedReports = cleanJSON(reports);
      reports = JSON.parse(cleanedReports);
    } catch (error) {
      console.error('Error parsing reports:', error);
      return (
        <div className="p-5">
          <NavBar />
          <p className="text-red-500">Error parsing reports data: {error.message}</p>
        </div>
      );
    }
  }

  // Check if the reports object contains any keys with data
  const reportSections = Object.entries(reports).filter(([key, value]) => Array.isArray(value) && value.length > 0);

  if (reportSections.length === 0) {
    console.warn('No report data available.'); // Warn if no report data
    return (
      <div className="p-5">
        <NavBar />
        <h1 className="text-2xl mt-5 text-blue-500 font-bold">Report Analysis</h1>
        <p className="text-gray-600 mt-2">No report data available.</p>
      </div>
    );
  }

  return (
    <div className="p-5">
      <NavBar />
      <h1 className="text-2xl mt-5 text-blue-500 font-bold">Report Analysis</h1>

      {reportSections.map(([sectionKey, sectionData], index) => (
        <div key={index} className="mt-4 p-4 border rounded shadow-sm">
          <h2 className="text-xl font-semibold capitalize text-blue-500 mb-3">
            {formatHeading(sectionKey)}
          </h2>
          <ul className="list-disc pl-6 text-gray-800">
            {sectionData.map((item, i) => (
              // Remove '*' from the text
              <li key={i}>{item.replace(/\*/g, '')}</li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
};

// Helper function to clean markdown formatting from a JSON string
function cleanJSON(rawString) {
  let cleanString = rawString.trim();

  // Remove leading code fence
  if (cleanString.startsWith("```")) {
    const firstNewline = cleanString.indexOf("\n");
    if (firstNewline !== -1) {
      cleanString = cleanString.substring(firstNewline + 1);
    }
  }

  // Remove trailing code fence
  if (cleanString.endsWith("```")) {
    const fenceIndex = cleanString.lastIndexOf("```");
    cleanString = cleanString.substring(0, fenceIndex).trim();
  }

  return cleanString;
}

// Helper to format section headings
function formatHeading(heading) {
  return heading
    .replace(/_/g, ' ')
    .replace(/\b\w/g, char => char.toUpperCase());
}

export default Report;
