import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

const Reports = () => {
  const { id } = useParams();
  const [reports, setReports] = useState([]);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [selectedPdf, setSelectedPdf] = useState(null);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const response = await axios.get(`/api/reports/${id}`);
        setReports(response.data.reports);
      } catch (error) {
        if (error.response && error.response.status === 401) {
          console.error('Unauthorized: Redirecting to login.');
          window.location.href = '/login'; // Redirect to login page
        } else {
          console.error('Error fetching reports:', error);
        }
      }
    };

    fetchReports();
  }, [id]);

  const handleViewPhoto = (photoBase64) => {
    if (photoBase64) {
      const photoUrl = `data:image/png;base64,${photoBase64}`;
      setSelectedPhoto(photoUrl);
    } else {
      console.warn('No photo data available to view.');
    }
  };

  const handleViewPdf = (pdfBase64) => {
    if (pdfBase64) {
      const pdfUrl = `data:application/pdf;base64,${pdfBase64}`;
      setSelectedPdf(pdfUrl);
    } else {
      console.warn('No PDF data available to view.');
    }
  };

  const handleDownloadPdf = (pdfBase64, reportId) => {
    if (pdfBase64) {
      const pdfBlob = new Blob([Uint8Array.from(atob(pdfBase64), c => c.charCodeAt(0))], { type: 'application/pdf' });
      const pdfUrl = URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = pdfUrl;
      link.download = `report-${reportId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(pdfUrl); // Clean up the object URL
    } else {
      console.warn('No PDF data available to download.');
    }
  };

  const handleClosePhoto = () => {
    setSelectedPhoto(null);
  };

  const handleClosePdf = () => {
    setSelectedPdf(null);
  };

  return (
    <div className="p-5">
      <h1 className="text-xl text-blue-500 font-semibold">Patient Reports</h1>
      {reports.length > 0 ? (
        <ul className="mt-5">
          {reports.map((report, index) => (
            <li key={index} className="mb-4 border p-2">
              <h4 className="font-bold">
                {new Date(report.dateTime).toLocaleString()}
              </h4>
              <p>ID: {report._id}</p>
              <div className="flex justify-between">
                <div className="flex gap-5 mt-2">
                  {report.photo ? (
                    <>
                      <button
                        onClick={() => handleViewPhoto(report.photo)}
                        className="text-blue-600 underline"
                      >
                        View Photo
                      </button>
                      <a
                        href={`data:image/png;base64,${report.photo}`}
                        download={`report-${report._id}.png`}
                        className="text-blue-600 underline"
                      >
                        Download Photo
                      </a>
                    </>
                  ) : (
                    <p className="text-gray-500">No photo available</p>
                  )}
                  {report.fileData ? (
                    <>
                      <button
                        onClick={() => handleViewPdf(report.fileData)}
                        className="text-blue-600 underline"
                      >
                        View PDF
                      </button>
                      <button
                        onClick={() => handleDownloadPdf(report.fileData, report._id)}
                        className="text-blue-600 underline"
                      >
                        Download PDF
                      </button>
                    </>
                  ) : (
                    <p className="text-gray-500">No PDF available</p>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p>No reports found for this patient.</p>
      )}

      {/* Modal overlay to display selected photo */}
      {selectedPhoto && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-4 rounded shadow-lg">
            <div>
              <button
                onClick={handleClosePhoto}
                className="bg-red-500 mt-10 text-white w-full font-bold text-lg"
              >
                Close
              </button>
            </div>
            <div>
              <img
                src={selectedPhoto}
                alt="Report"
                className="max-w-full max-h-screen"
              />
            </div>
          </div>
        </div>
      )}

      {/* Modal overlay to display selected PDF */}
      {selectedPdf && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-4 rounded shadow-lg">
            <div>
              <button
                onClick={handleClosePdf}
                className="bg-red-500 mt-10 text-white w-full font-bold text-lg"
              >
                Close
              </button>
            </div>
            <div>
              <iframe
                src={selectedPdf}
                title="PDF Report"
                className="w-full h-screen"
                frameBorder="0"
                allow="fullscreen"
                onLoad={() => console.log('PDF iframe loaded successfully')} // Debug iframe load
                onError={() => console.error('Error loading PDF in iframe')} // Debug iframe error
              ></iframe>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;