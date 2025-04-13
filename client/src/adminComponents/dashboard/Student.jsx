import React, { useState,useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { IoEyeSharp } from "react-icons/io5";
import { MdEdit,MdDelete } from "react-icons/md";
import axios from 'axios';
export default function Student() {
    const [studentsData, setStudentsData] = useState([]);
    const navigate=useNavigate();
    const handleViewClick = (student) => {
        navigate(`/student-details/${student.id}`, { state: { student } });
      };
      const handleEditClick = (student) => {
        navigate(`/edit-student/${student.id}`, { state: { student } });
      };
      useEffect(() => {
        axios.get('http://localhost:3009/combined-students')
          .then(response => {
            setStudentsData(response.data);
          })
          .catch(error => {
            console.error('Error fetching combined students data:', error);
          });
      }, []);
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
  )
}
