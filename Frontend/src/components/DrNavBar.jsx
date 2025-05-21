import { useNavigate } from 'react-router-dom';
import { ReportsContext } from '../context/userContext';

const DrNavBar = () => {
  const navigate = useNavigate();
  const redirectToHome = () => {
    navigate('/DrHome');
  };

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
    {/* <div className='bg-blue-500 w-45 rounded-full text-white p-5 text-2xl font-semibold m-1'>
        <p>
        CareIQ
        </p>
    </div> */}
    <div className='flex bg-blue-500 justify-between rounded-full  p-2'>
    <div className='gap-1 flex'>
    <button onClick={redirectToHome} className="border-2 p-2 bg-white w-20 rounded-full text-blue-500  font-semibold">
      Home
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

export default DrNavBar