import React, { useState } from 'react';
import Header from './Header';
import './dashboard.css';
import Sidebar from './sidebar';
import BusDetails from './BusDetails';
import Students from './Student';
import StudentAttendance from './StudentAttendance';
import FacultyRequestPage from './FacultyRequestPage';

function Dashboard() {
  const [currentPage, setCurrentPage] = useState('BusDetails');
  const [searchQuery, setSearchQuery] = useState('');
  const [notificationTab, setNotificationTab] = useState('FacultyRequests'); // default tab inside Notifications

  // Render sub-content for Notifications
  const renderNotificationsContent = () => {
    switch (notificationTab) {
      case 'FacultyRequests':
        return <FacultyRequestPage />;
      // Future cases:
      // case 'StudentRequests':
      //   return <StudentRequestPage />;
      default:
        return <div>Select a notification type</div>;
    }
  };

  // Render the main page content
  let content;
  if (currentPage === 'BusDetails') {
    content = <BusDetails searchQuery={searchQuery} />;
  } else if (currentPage === 'Students') {
    content = <Students searchQuery={searchQuery} />;
  } else if (currentPage === 'StudentAttendance') {
    content = <StudentAttendance searchQuery={searchQuery} />;
  } else if (currentPage === 'Notifications') {
    content = (
      <div className="container">
        <h2 className="mb-4">Notifications</h2>
        <div className="btn-group mb-3">
          <button
            className={`btn btn-outline-primary ${notificationTab === 'FacultyRequests' ? 'active' : ''}`}
            onClick={() => setNotificationTab('FacultyRequests')}
          >
            Faculty Requests
          </button>
          {/* Future buttons
          <button
            className={`btn btn-outline-primary ${notificationTab === 'StudentRequests' ? 'active' : ''}`}
            onClick={() => setNotificationTab('StudentRequests')}
          >
            Student Requests
          </button> */}
        </div>
        {renderNotificationsContent()}
      </div>
    );
  } else {
    content = <h2>Page Not Found</h2>;
  }

  return (
    <div className="layout">
      <Sidebar setCurrentPage={setCurrentPage} />
      <div className="main-content">
        <Header setSearchQuery={setSearchQuery} />
        {content}
      </div>
    </div>
  );
}

export default Dashboard;
