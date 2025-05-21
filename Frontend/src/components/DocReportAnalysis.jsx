import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

const DocReportAnalysis = () => {
  const { id } = useParams();
  const [reportAnalysis, setReportAnalysis] = useState({});
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState(null);

  useEffect(() => {
    const fetchReportAnalysis = async () => {
      try {
        const response = await axios.get(`/api/reportAnalysis/${id}`, {
          withCredentials: true        // ← send your authToken cookie
        });
        setReportAnalysis(response.data.reportAnalysis || {});
      } catch (err) {
        console.error('Error fetching report analysis:', err);
        setError(
          err.response?.data?.message ||
          'An error occurred while fetching the report analysis.'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchReportAnalysis();
  }, [id]);

  if (loading) {
    return (
      <div className="p-5">
        <p className="text-blue-500">Loading report analysis...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-5">
        <p className="text-red-500">Error: {error}</p>
      </div>
    );
  }

  // Turn { summary: [...], abnormal_results: [...], ... } into [ ['summary', [...]], ... ]
  const sections = Object.entries(reportAnalysis);

  if (sections.length === 0) {
    return (
      <div className="p-5">
        <h1 className="text-2xl mt-5 text-blue-500 font-bold">Report Analysis</h1>
        <p className="text-gray-600 mt-2">No report analysis data available.</p>
      </div>
    );
  }

  return (
    <div className="p-5">
      <h1 className="text-2xl mt-5 text-blue-500 font-bold">Report Analysis</h1>

      {sections.map(([sectionName, items]) => (
        <div key={sectionName} className="mt-4 p-4 border rounded shadow-sm">
          <h2 className="text-xl font-semibold capitalize text-blue-500 mb-3">
            {sectionName.replace(/_/g, ' ')}
          </h2>
          <ul className="list-disc pl-6 text-gray-800">
            {Array.isArray(items) && items.map((item, idx) => (
              <li key={idx}>{item.replace(/\*/g, '')}</li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
};

export default DocReportAnalysis;
