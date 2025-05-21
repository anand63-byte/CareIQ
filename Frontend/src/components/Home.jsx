import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';                      // ← use axios instead of fetch
import { ReportsContext } from '../context/userContext';
import NavBar from './NavBar';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const { userData } = useContext(ReportsContext);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [loading, setLoading] = useState(true); // ← track when auth-check is done
  const navigate = useNavigate();

  useEffect(() => {
    // 1️⃣ Check auth once on mount
    axios.get('/api/home', { withCredentials: true })
      .then(res => {
        if (!res.data.loggedIn) {
          // not logged in → bounce to sign-in
          navigate('/sign-in');
        } else {
          // logged in → stop loading and let the page render
          setLoading(false);
        }
      })
      .catch(err => {
        console.error('Auth error:', err);
        navigate('/sign-in');
      });
  }, [navigate]);

  // 2️⃣ Don’t render anything (and don’t redirect) until auth-check is done
  if (loading) return null; // or a spinner if you prefer

  // 3️⃣ From here on, we know we’re logged in:
  const handleDelete = async (id) => {
    try {
      await axios.delete(`/api/delete/${id}`, { withCredentials: true });
      alert('Report deleted successfully.');
      navigate('/'); // reload the page
    } catch (err) {
      console.error('Error deleting report:', err);
      alert('Failed to delete the report.');
    }
  };

  const handleViewPhoto = (photoUrl) => {
    setSelectedPhoto(photoUrl);
  };

  const handleClosePhoto = () => {
    setSelectedPhoto(null);
  };

  const handleViewPdf = (pdfBase64) => {
    if (pdfBase64) {
      const pdfUrl = pdfBase64; // Use the Base64 data directly
      window.open(pdfUrl, '_blank'); // Open the PDF in a new tab
    } else {
      console.warn('No PDF data available to view.');
    }
  };

  const handleDownloadPdf = (pdfBase64, reportId) => {
    if (pdfBase64) {
      const pdfBlob = new Blob([Uint8Array.from(atob(pdfBase64.split(',')[1]), c => c.charCodeAt(0))], { type: 'application/pdf' });
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

  return (
    <div className='p-5'>
      <NavBar />

      {userData && (
        <div className="mt-4">
          <h2 className='text-xl text-blue-500 font-semibold'>
            Welcome, <span className='font-bold'>{userData.name}</span>
          </h2>
          <h3 className='mt-5 text-blue-500 font-semibold'>Your Reports:</h3>
          <ul>
            {userData.reports.map((report, idx) => (
              <li key={idx} className="mb-4 border mt-5 p-2">
                <h4 className="font-bold">
                  {new Date(report.dateTime).toLocaleString()}
                </h4>
                <p>ID: {report._id}</p>
                <div className='flex justify-between mt-2'>
                  <div className="flex gap-5">
                    {report.photo && (
                      <>
                        <button
                          onClick={() => handleViewPhoto(report.photo)}
                          className="text-blue-600 underline"
                        >
                          View Photo
                        </button>
                        <a
                          href={report.photo}
                          download={`report-${report._id}.png`}
                          className="text-blue-600 underline"
                        >
                          Download Photo
                        </a>
                      </>
                    )}
                    {report.fileData && (
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
                    )}
                  </div>
                  <button
                    onClick={() => handleDelete(report._id)}
                    className='text-red-500 underline'
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {selectedPhoto && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-4 rounded shadow-lg">
            <button
              onClick={handleClosePhoto}
              className="bg-red-500 mb-4 text-white w-full font-bold py-2"
            >
              Close
            </button>
            <img src={selectedPhoto} alt="Report" className="max-w-full max-h-screen" />
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
