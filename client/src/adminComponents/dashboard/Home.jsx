import React, { useState,useEffect } from 'react';
import BusDetailsPage from './BusDetailsPage';
import { useNavigate } from 'react-router-dom';
import studentsData from './studentsData';
import { IoEyeSharp } from "react-icons/io5";
import { MdEdit,MdDelete } from "react-icons/md";
//import busDetailsData from './busDetailsData';
import Buscreate from './buscreate';
import axios from 'axios';
import './style.css';



function Home({ currentPage,changePage}) {
  const [selectedBus, setSelectedBus] = useState(null);
  const [editingBus, setEditingBus] = useState(null);
  const [selectedBusID, setSelectedBusID] = useState(null);
  const [showDeletePopup, setShowDeletePopup] = useState(null);
  const [studentsData, setStudentsData] = useState([]);
  const [busSourceData, setBusSourceData] = useState([]);
  const [busNoData, setBusNoData] = useState([]);
  const [historyDate, setHistoryDate] = useState(new Date().toISOString().slice(0, 10));
  const [attendanceHistory, setAttendanceHistory] = useState([]);
  const navigate = useNavigate();
  const handleBusClick = (bus) => {
    setSelectedBus(bus);
  };
  const handleEdit = (busID) => {
    setSelectedBusID(busID);
    changePage('BusDetailsPage'); // Navigate to BusDetailsPage
  };
  const handleViewClick = (student) => {
    navigate(`/student-details/${student.id}`, { state: { student } });
  };
  const handleEditClick = (student) => {
    navigate(`/edit-student/${student.id}`, { state: { student } });
  };
  const [busdata,setBusData]=useState([])
  useEffect(() => {
    axios.get('http://localhost:3009/bus-details')
      .then(response => {
        setBusData(response.data);
      })
      .catch(error => {
        console.error('Error fetching bus data:', error);
      });
  }, []);
  useEffect(() => {
    axios.get('http://localhost:3009/combined-students')
      .then(response => {
        setStudentsData(response.data);
      })
      .catch(error => {
        console.error('Error fetching combined students data:', error);
      });
  }, []);
  const fetchAttendanceHistory = async () => {
    try {
      const response = await axios.get('http://localhost:3009/attendance', {
        params: { date: historyDate },
      });
      setAttendanceHistory(response.data);
    } catch (err) {
      console.error('Error fetching attendance history:', err);
      setError('Failed to load attendance history. Please try again.');
    }
  };
 /* useEffect(() => {
    axios.get('http://localhost:3009/students')  // Adjust the endpoint as per your server
      .then(response => {
        setStudentsData(response.data);
      })
      .catch(error => {
        console.error('Error fetching students data:', error);
      });
  }, []);
  useEffect(() => {
    axios.get('http://localhost:3009/busSource')  // Adjust the endpoint as per your server
      .then(response => {
        setBusSourceData(response.data);
      })
      .catch(error => {
        console.error('Error fetching students data:', error);
      });
  }, []);
  useEffect(() => {
    axios.get('http://localhost:3009/busNo')  // Adjust the endpoint as per your server
      .then(response => {
        setBusNoData(response.data);
      })
      .catch(error => {
        console.error('Error fetching students data:', error);
      });
  }, []);*/


  const handleSaveEdit = () => {
    // Update the bus data in the state or backend
    console.log('Saving edited bus:', editingBus);
    setEditingBus(null);
  };

  const handleCancelEdit = () => {
    setEditingBus(null);
  };

  const handleDelete = (bus) => {
    console.log('Attempting to delete bus with ID:', bus._id);
    axios.delete(`http://localhost:3009/bus-details/${bus._id}`)
      .then(response => {
        console.log('Bus deleted successfully:', bus);
        const updatedBusData = busdata.filter((b) => b.id !== bus.id);
        setBusData(updatedBusData);
        setShowDeletePopup(null);
      })
      .catch(error => {
        console.error('Error deleting bus:', error);
      });
  };
  
  const handleCancelDelete = () => {
    setShowDeletePopup(null);
  };
   const handleCreate = ()=>{
    changePage('buscreate');
   };
   
   const renderPageContent = () => {
    switch (currentPage) {
      case 'BusDetails':
        return (
          <div className="main-container">
            <div className="main-title mb-4">
            <h3>Bus Details</h3>
              <button
                className='btn btn-primary'
                style={{width:'200px'}} 
                onClick={handleCreate}
              >
                Create & Add another
              </button>
            </div>
            <div className="row">
              {busdata.map((bus) => (
                <div
                  key={bus.id}
                  className="col-12 col-md-6 col-lg-4 bus-card"
                  onClick={() => handleBusClick(bus)}
                >
                  <div
                    className="bus-details"
                    style={{
                      border: '2px solid',
                      backgroundColor: 'white',
                      padding: '10px',
                      color: 'black',
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                    }}
                  >
                    <div>
                      <p>Source: {bus.source}</p>
                      <p>Bus Route: {bus.busRoute}</p>
                    </div>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'flex-end',
                        gap: '10px',
                      }}
                    >
                      <button
                        className="btn btn-primary"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEdit(bus.id);
                        }}
                      >
                        Edit
                      </button>

                      <button
                        className="btn btn-danger"
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowDeletePopup(bus.id);
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                  {showDeletePopup !== null && (
        <div
          className="delete-popup-container"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1,
          }}
        >
          <div className="delete-popup">
            <p>Are you sure you want to delete this bus entry?</p>
            <div>
              <button className="btn btn-danger" onClick={() => handleDelete(busdata.find((b) => b.id === showDeletePopup))}>
                OK
              </button>
              <button className="btn btn-secondary" onClick={handleCancelDelete}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
                  {selectedBus && selectedBus.id === bus.id && (
                    <div
                      className="additional-info"
                      style={{
                        border: '2px solid',
                        backgroundColor: 'white',
                        padding: '10px',
                        marginTop: '10px',
                      }}
                    >
                    </div>
                  )}
                  {editingBus && editingBus.id === bus.id && (
                    <div
                      className="edit-form"
                      style={{
                        border: '2px solid',
                        backgroundColor: 'white',
                        padding: '10px',
                        marginTop: '10px',
                      }}
                    >
                      <h4>Edit Bus</h4>
                      <input
                        type="text"
                        value={editingBus.source}
                        onChange={(e) =>
                          setEditingBus({ ...editingBus, source: e.target.value })
                        }
                      />
                      <input
                        type="text"
                        value={editingBus.busRoute}
                        onChange={(e) =>
                          setEditingBus({ ...editingBus, busRoute: e.target.value })
                        }
                      />
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'flex-end',
                          gap: '10px',
                        }}
                      >
                        <button
                          className="btn btn-primary"
                          onClick={handleSaveEdit}
                        >
                          Save
                        </button>
                        <button
                          className="btn btn-secondary"
                          onClick={handleCancelEdit}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        );
        case 'BusDetailsPage':
        return <BusDetailsPage selectedBusID={selectedBusID} />;
      case 'buscreate':
        return <Buscreate/>
        case 'Students':
          return (
            <div className="main-container">
              <div className="main-title">
                <h3>Students</h3>
              </div>
              <table className="table">
                <thead>
                  <tr>
                    <th>S.No</th>
                    <th>Name</th>
                    <th>Gender</th>
                    <th>Bus Source</th>
                    <th>Bus No</th>
                    <th colSpan="3" style={{ textAlign: 'center' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {studentsData.map((student, index) => (
                    <tr key={student.email}>
                      <td>{index + 1}</td>
                      <td>{student.name}</td>
                      <td>{student.gender}</td>
                      <td>{student.busSource}</td>
                      <td>{student.busNo}</td>
                      <td>
                        <div className="row">
                          <div className="col"><button className='btn btn-success' onClick={() => handleViewClick(student)}>View</button> <IoEyeSharp /></div>
                          <div className="col"><button className='btn btn-primary' onClick={() => handleEditClick(student)}>Edit</button> <MdEdit /></div>
                          <div className="col"><button className='btn btn-danger'>Delete</button> <MdDelete /></div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
            case 'Student Attendance':
        return (
          <div className="main-container">
            <div className="main-title">
            <h2 className="mt-5">Attendance History</h2>
        <div className="mb-3">
          <label htmlFor="historyDate">Select Date:</label>
          <input
            type="date"
            id="historyDate"
            className="form-control"
            value={historyDate}
            onChange={(e) => setHistoryDate(e.target.value)}
          />
          <button
            className="btn btn-secondary mt-2"
            onClick={fetchAttendanceHistory}
          >
            View Attendance
          </button>
        </div>
        <table className="table table-striped">
          <thead>
            <tr>
              <th>Roll No</th>
              <th>Name</th>
              <th>Attendance</th>
            </tr>
          </thead>
          <tbody>
            {attendanceHistory.length > 0 ? (
              attendanceHistory.map((record, index) => (
                <tr key={index}>
                  <td>{record.rollno}</td>
                  <td>{record.name}</td>
                  <td>{record.status}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="3" className="text-center">
                  No attendance records found for this date.
                </td>
              </tr>
            )}
          </tbody>
        </table>
            </div>
            {/* Add your settings content here */}
          </div>
        );
      case 'Logout':
        // You might want to handle logout action here
        return null;
      default:
        return null;
    }
  };

  return renderPageContent();
}

export default Home;