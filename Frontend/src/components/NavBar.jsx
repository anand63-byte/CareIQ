import { useNavigate } from 'react-router-dom';
import { ReportsContext } from '../context/userContext';

const NavBar = () => {
  const navigate = useNavigate();
  const redirectToHome = () => {
    navigate('/');
  };

  // const redirectToSignIn = () => {
  //   navigate('/sign-in');
  // };

  // const redirectToLogin = () => {
  //   navigate('/login');
  // };

  const redirectToReports = () => {
    navigate('/report');
  };

  const redirectToUploadReport = () => {
    navigate('/uploadReport');
  };

  const redirectToAllDoctors = () => {
    navigate('/allDoctors');
  };

  const redirectToMyDoctors = () => {
    navigate('/myDoctors');
  };

  const redirectToMediDecode = () => {
    navigate('/mediDecode');
  }

  const redirectToPrescriptionDecode = () => {
    navigate('/prescriptionDecode');
  }

  const handleLogOut = async () => {
    try {
      const response = await fetch('/api/logout');
      const data = await response.json();
      if (response.ok) {
        navigate(data.redirect); // Redirect to '/sign-in'
      } else {
        console.error('Logout failed:', data.message);
      }
    } catch (error) {
      console.error('Error during logout:', error);
    }
  }

  return (
    <div>
        <div className='flex bg-blue-500 justify-between rounded-full  p-2'>


<div className='gap-1 flex'>

<button onClick={redirectToHome} className="border-2 p-2 bg-white w-20 rounded-full text-blue-500  font-semibold">
  Home
</button>
<button onClick={redirectToReports} className="border-2 p-2 bg-white w-40 rounded-full text-blue-500  font-semibold">
  Reports Analysis
</button>
<button onClick={redirectToUploadReport} className="border-2 p-2 bg-white w-40 rounded-full text-blue-500  font-semibold">
  Upload Report
</button>
<button onClick={redirectToAllDoctors} className="border-2 p-2 bg-white w-25 rounded-full text-blue-500  font-semibold">
  Doctors
</button>
<button onClick={redirectToMyDoctors} className="border-2 p-2 bg-white w-30 rounded-full text-blue-500  font-semibold">
  My Doctors
</button>
<button onClick={redirectToMediDecode} className="border-2 p-2 bg-white w-35 rounded-full text-blue-500  font-semibold">
  Medi Decode
</button>
<button onClick={redirectToPrescriptionDecode} className="border-2 p-2 bg-white w-45 rounded-full text-blue-500  font-semibold">
  Prescription Decode
</button>
</div>

<div className='gap-5 flex'>
    {/* <button onClick={redirectToSignIn} className="border-2 p-2 bg-white w-30 rounded-full text-blue-500 font-semibold">
      Sign In
    </button>
    <button onClick={redirectToLogin} className="border-2 p-2 bg-white w-30 rounded-full text-blue-500 font-semibold">
      Login
    </button> */}
    <button onClick={handleLogOut} className="border-2 p-2 bg-white w-25 rounded-full text-blue-500 font-semibold">
      Logout
    </button>
</div>


</div>
    </div>
  )
}

export default NavBar