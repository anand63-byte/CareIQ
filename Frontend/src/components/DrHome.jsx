import React from 'react';
import { useDrContext } from '../context/drContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import DrNavBar from './DrNavBar';

const DrHome = () => {
    const { doctorData, loading, error } = useDrContext();
    const navigate = useNavigate(); // Import and initialize navigate

    if (loading) {
        return <div className="p-5">Loading doctor data...</div>;
    }

    if (error) {
        return <div className="p-5 text-red-500">Error: {error}</div>;
    }

    if (!doctorData) {
        return <div className="p-5">No doctor data available.</div>;
    }

    const handleRemovePatient = async (patientId) => {
        try {
            const response = await axios.delete(`/api/removePatient/${patientId}`);
            if (response.status === 200) {
                alert('Patient removed successfully.');
                navigate('/DrHome'); // Navigate back to DrHome
            }
        } catch (error) {
            console.error('Error removing patient:', error);
            alert(error.response?.data?.message || 'An error occurred while removing the patient.');
        }
    };

    const handleViewReports = (patientId) => {
        navigate(`/reports/${patientId}`); // Navigate to the reports page for the selected patient
    }

    const handleReportAnalysis = (patientId) => {
        navigate(`/reportAnalysis/${patientId}`); // Navigate to the report analysis page for the selected patient
    }

    return (
        <div className="p-5">
            <DrNavBar/>
            <h1 className="text-2xl font-bold text-blue-500 mt-5">Welcome, Dr. {doctorData.doctor.name}</h1>
            <h2 className="text-xl mt-4 font-semibold">Your Patients:</h2>
            {doctorData.doctor.patients.length > 0 ? (
                doctorData.doctor.patients.map((patient) => (
                    <div key={patient.id} className="mt-5 p-2 border-2">
                        <h3 className="font-bold text-lg">{patient.name}</h3>
                        <p>Email: {patient.email}</p>
                            <p>Reports: {patient.reports.length}</p>
                        <div className="flex justify-between mt-2">
                          <div className='gap-5 flex'>
                                <button
                                      onClick={() => handleViewReports(patient.id)}
                                      className="text-blue-500 underline"
                                      >
                                      View Reports
                                </button>
                                <button
                                    onClick={() => handleReportAnalysis(patient.id)}
                                    className="text-blue-500 underline"
                                >
                                  Report Analysis
                                </button>
                            </div>
                            <button
                                onClick={() => handleRemovePatient(patient.id)}
                                className="text-red-500 underline"
                            >
                                Remove
                            </button>
                        </div>
                    </div>
                ))
            ) : (
                <p className="mt-4 text-gray-600">You currently have no patients assigned.</p>
            )}
        </div>
    );
};

export default DrHome;