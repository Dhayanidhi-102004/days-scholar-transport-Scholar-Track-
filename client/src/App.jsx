/*import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import Login from './login';
import Home from './home';
import Registration from './registration';
import Busbooking from './bus_booking';
import BusRouteDetails from './BusRouteDetails';
import Success from './Success';
import AdminLogin from './adminComponents/admin';
import Dashboard from './adminComponents/dashboard/dashboard';
import SeatBooking from './seat_booking';
import FacultyLogin from './adminComponents/faculty';
import AdminRegistration from './adminComponents/adminRegister';
import FacultyRegistration from './adminComponents/facultyRegister';

function App() {
  // Check if admin is authenticated
  const isAdminAuthenticated = sessionStorage.getItem('isAdmin') === 'true';
  // Check if a general user is authenticated
  const isUserLoggedIn = sessionStorage.getItem('isUserLoggedIn') === 'true';

  console.log('isAdminAuthenticated:', isAdminAuthenticated);
  console.log('isUserLoggedIn:', isUserLoggedIn);

  useEffect(() => {
    if (window.location.pathname === '/') {
      // Reset admin session if navigating to normal login
      sessionStorage.setItem('isAdmin', 'false');
    }
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Registration />} />
        <Route path="/adminRegister" element={<AdminRegistration/>} />
        <Route path="/facultyRegister" element={<FacultyRegistration/>}/>
        //{ Protected Routes for Logged-In Users }
            <Route path="/home" element={<Home />} />
            <Route path="/bus_booking/:email" element={<Busbooking />} />
            <Route path="/BusRouteDetails/:busIndex" element={<BusRouteDetails />} />
            <Route path="/seat-booking/:busNo" element={<SeatBooking />} />
            <Route path="/success" element={<Success />} />

        { Admin Routes }
        <Route path="/admin" element={<AdminLogin />} />
        <Route path="/faculty" element={<FacultyLogin />} />

        {isAdminAuthenticated ? (
          <Route path="/dashboard" element={<Dashboard />} />
        ) : (
          <Route path="/dashboard" element={<Navigate to="/admin" />} />
        )}
      </Routes>
    </BrowserRouter>
  );
}

export default App;*/
import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import Login from './login';
import Home from './home';
import Registration from './registration';
import Busbooking from './bus_booking';
import BusRouteDetails from './BusRouteDetails';
import Success from './Success';
import AdminLogin from './adminComponents/admin';
import Dashboard from './adminComponents/dashboard/dashboard';
import SeatBooking from './seat_booking';
import FacultyLogin from './adminComponents/faculty';
import FacultyPage from './adminComponents/facultyPage';
import AdminRegistration from './adminComponents/adminRegister';
import FacultyRegistration from './adminComponents/facultyRegister';
import StudentDetails from './adminComponents/dashboard/StudentDetails';
import EditStudent from './adminComponents/dashboard/EditStudent';
import BusDetails from './adminComponents/dashboard/BusDetails';
import BusDetailsCreate from './adminComponents/dashboard/buscreate';
import BusDetailsEditPage from './adminComponents/dashboard/BusDetailsPage';
import Student from './adminComponents/dashboard/Student';
import StudentAttendance from './adminComponents/dashboard/StudentAttendance';
import HolidaysPage from './adminComponents/dashboard/Holiday';
import CollegeMap from './adminComponents/dashboard/college_map';
import FacultyRequestPage from './adminComponents/dashboard/FacultyRequestPage';
import BusSeatBooking from './bus_seat_booking';
import GenerateQRCode from './generateQRCode';
import ScanQRCode from './Scanner';
function App() {
  const isAdminAuthenticated = sessionStorage.getItem('isAdmin') === 'true';
  const isUserLoggedIn = sessionStorage.getItem('isUserLoggedIn') === 'true';
  console.log('isAdminAuthenticated:', isAdminAuthenticated);
  console.log('isUserLoggedIn:', isUserLoggedIn);

  useEffect(() => {
    const handleRouteChange = () => {
      const adminRoutes = ['/dashboard'];
      const currentPath = window.location.pathname;

      // Reset admin session if navigating away from admin routes
      if (!adminRoutes.includes(currentPath)) {
        sessionStorage.setItem('isAdmin', 'false');
        //navigate('/login');
      }
    };

    // Add event listener for route changes
    window.addEventListener('popstate', handleRouteChange);

    // Initial check on component mount
    handleRouteChange();

    // Cleanup listener on unmount
    return () => {
      window.removeEventListener('popstate', handleRouteChange);
    };
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Login />} />
        <Route path="/Students" element={<Student />} />
        <Route path="/Holidays" element={<HolidaysPage />} />
        <Route path="/collegeMap" element={<CollegeMap />} />
        <Route path="/StudentAttendance" element={<StudentAttendance />} />
        <Route path="/FacultyRequestPage" element={<FacultyRequestPage/>}/>
        <Route path="/busDetails" element={<BusDetails />} />
        <Route path="/busCreate" element={<BusDetailsCreate />} />
        <Route path="/busDetailsEdit" element={<BusDetailsEditPage />} />
        <Route path="/register" element={<Registration />} />
        <Route path="/adminRegister" element={<AdminRegistration />} />
        <Route path="/facultyRegister" element={<FacultyRegistration />} />
        <Route path="/facultyPage" element={<FacultyPage />} />
        <Route path="/student-details/:id" element={<StudentDetails />} />
        <Route path="/edit-student/:id" element={<EditStudent />} />
        <Route path="/home" element={<Home />} />
            <Route path="/bus_booking/:email" element={<Busbooking />} />
            <Route path="/BusRouteDetails/:busIndex" element={<BusRouteDetails />} />
            {/*<Route path="/seat-booking/:busNo" element={<SeatBooking />} />*/}
            <Route path="/busSeat" element={<BusSeatBooking/>}/>
            <Route path="/success" element={<Success />} />
        {/* Protected Routes for Logged-In Users */}
        {isUserLoggedIn ? (
          <>
            
          </>
        ) : (
          <Route path="*" element={<Navigate to="/" />} />
        )}

        {/* Admin Routes */}
        <Route path="/admin" element={<AdminLogin />} />
        <Route path="/faculty" element={<FacultyLogin />} />

        {isAdminAuthenticated ? (
          <Route path="/dashboard" element={<Dashboard />} />
        ) : (
          <Route path="/dashboard" element={<Navigate to="/admin" />} />
        )}
      </Routes>
    </BrowserRouter>
  );
}

export default App;
