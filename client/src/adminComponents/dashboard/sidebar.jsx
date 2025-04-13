import React from 'react';
import { FaBusAlt } from 'react-icons/fa';
import { PiStudentFill } from 'react-icons/pi';
import { BsFillCalendarFill } from 'react-icons/bs';
import { MdNotifications } from 'react-icons/md';
import { MdLogout, MdOutlineEmojiTransportation } from 'react-icons/md';

function Sidebar({ setCurrentPage }) {
  return (
    <aside id="sidebar">
      <div className="sidebar-title">
        <div className="sidebar-brand">
          <MdOutlineEmojiTransportation className="icon_header" /> TRANSPORT
        </div>
      </div>

      <ul className="sidebar-list">
        <li className="sidebar-list-item">
          <button onClick={() => setCurrentPage('BusDetails')} className="sidebar-button">
            <FaBusAlt className="icon" /> Bus Details
          </button>
        </li>
        <li className="sidebar-list-item">
          <button onClick={() => setCurrentPage('Students')} className="sidebar-button">
            <PiStudentFill className="icon" /> Students
          </button>
        </li>
        <li className="sidebar-list-item">
          <button onClick={() => setCurrentPage('StudentAttendance')} className="sidebar-button">
            <BsFillCalendarFill className="icon" /> Student Attendance
          </button>
        </li>
        <li className="sidebar-list-item">
          <button onClick={() => setCurrentPage('Notifications')} className="sidebar-button">
            <MdNotifications className="icon" /> Notifications
          </button>
        </li>
        <li className="sidebar-list-item">
          <button className="sidebar-button">
            <MdLogout className="icon" /> Logout
          </button>
        </li>
      </ul>
    </aside>
  );
}

export default Sidebar;
