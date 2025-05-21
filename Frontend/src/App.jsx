import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Report from "./components/Report";
import SignIn from "./components/SignIn";
import Login from "./components/Login";
import Home from "./components/Home";
import DrSignIn from "./components/DrSignIn"; 
import DrHome from "./components/DrHome";
import UploadReport from "./components/UploadReport"; // Import UploadReport component
import AllDoctors from "./components/AllDoctors"; // Import AllDoctors component
import MyDoctors from "./components/MyDoctors";
import Reports from "./components/Reports";
import DocReportAnalysis from "./components/DocReportAnalysis"; // Import DocReportAnalysis component
import MediDecode from "./components/MediDecode"; // Import MediDecode component
import PrescriptionDecode from "./components/PrescriptionDecode";

const App = () => {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/sign-in" element={<SignIn />} />
                <Route path="/login" element={<Login />} />
                <Route path="/report" element={<Report />} />
                <Route path="/uploadReport" element={<UploadReport />} /> {/* Add UploadReport route */}
                <Route path="/DrSignIn" element={<DrSignIn />} />
                <Route path="/DrHome" element={<DrHome />} />
                <Route path="/allDoctors" element={<AllDoctors/>} />
                <Route path="/myDoctors" element={<MyDoctors/>}/>
                <Route path="/reports/:id" element={<Reports />} />
                <Route path="/reportAnalysis/:id" element={<DocReportAnalysis />} /> {/* Add DocReportAnalysis route */}
                <Route path="/mediDecode" element={<MediDecode />} /> {/* Add MediDecode route */}
                <Route path="/prescriptionDecode" element={<PrescriptionDecode/>} />
            </Routes>
        </Router>
    );
};

export default App;