// dataFormatter.js

/**
 * Formats raw medical report data into a structured JSON format.
 * @param {Array} rawData - Array of raw medical reports.
 * @returns {Object} - Structured JSON data.
 */
function formatMedicalReports(rawData) {
  if (!Array.isArray(rawData) || rawData.length === 0) {
    return {
      reports: [],
      summary: {
        keyConsiderations: []
      }
    };
  }

  const reports = rawData
    .filter(report => report && report.type) // Ensure valid reports with a type
    .map((report, index) => {
      if (report.type === 'Lab Report') {
        return {
          id: index + 1,
          type: report.type,
          keyFindings: report.keyFindings || {},
          abnormalResults: report.abnormalResults || [],
          criticalPoints: report.criticalPoints || [],
          followUpActions: report.followUpActions || []
        };
      } else if (report.type === 'Prescription') {
        return {
          id: index + 1,
          type: report.type,
          patientDetails: report.patientDetails || {},
          clinicalDescription: report.clinicalDescription || {},
          medications: report.medications || [],
          abnormalResults: report.abnormalResults || [],
          criticalPoints: report.criticalPoints || [],
          followUpActions: report.followUpActions || []
        };
      }
      return null; // Skip unknown report types
    })
    .filter(report => report !== null); // Remove any null entries

  return {
    reports,
    summary: {
      keyConsiderations: rawData.summary || [] // Handle missing summary gracefully
    }
  };
}

module.exports = formatMedicalReports;