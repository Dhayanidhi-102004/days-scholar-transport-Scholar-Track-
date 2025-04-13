import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';

function EditStudent() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { student } = state;

  const [formData, setFormData] = useState({
    id: student._id,
    name: student.name,
    gender: student.gender,
    email: student.email,
    busSource: student.busSource,
    busNo: student.busNo,
  });

  const [busSources, setBusSources] = useState({}); // Stores bus sources and bus numbers
  const [availableBusNos, setAvailableBusNos] = useState([]); // Stores available bus numbers for selected bus source
  const [allBusSources, setAllBusSources] = useState([]); // Stores all bus sources for dropdown

  // Fetch bus sources and their respective bus numbers
  useEffect(() => {
    axios
      .get('http://localhost:3009/bus-sources-with-numbers')
      .then((response) => {
        const busData = response.data;
        console.log('API Response:', busData); // Log the response for debugging

        if (Object.keys(busData).length > 0) {
          setBusSources(busData); // Set bus sources with their respective bus numbers
          setAllBusSources(Object.keys(busData)); // Set available bus sources for dropdown

          // Pre-populate available bus numbers based on the student's current bus source
          if (busData[student.busSource]) {
            setAvailableBusNos(busData[student.busSource]);
          }
        } else {
          setAllBusSources([]);
        }
      })
      .catch((error) => {
        console.error('Error fetching bus sources:', error);
      });
  }, [student.busSource]); // Refetch when busSource changes

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    // Update busNo options if busSource changes
    if (name === 'busSource') {
      setAvailableBusNos(busSources[value] || []); // Set available bus numbers based on the selected bus source
      setFormData({ ...formData, busSource: value, busNo: '' }); // Reset busNo if busSource changes
    }
  };

  // Save updated student details
  const handleSave = () => {
    axios
      .put(`http://localhost:3009/update-student`, formData)
      .then(() => {
        alert('Student details updated successfully!');
        navigate(-1); // Go back to the previous page
      })
      .catch((error) => console.error('Error updating student details:', error));
  };

  return (
    <div className="edit-student-container">
      <h3>Edit Student Details</h3>
      <form>
        <div className="form-group">
          <label>Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            className="form-control"
          />
        </div>
        <div className="form-group">
          <label>Gender</label>
          <select
            name="gender"
            value={formData.gender}
            onChange={handleInputChange}
            className="form-control"
          >
            <option value="Male">Male</option>
            <option value="Female">Female</option>
          </select>
        </div>
        <div className="form-group">
          <label>Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            className="form-control"
            disabled // Disable email editing
          />
        </div>
        <div className="form-group">
          <label>Bus Source</label>
          <select
            name="busSource"
            value={formData.busSource}
            onChange={handleInputChange}
            className="form-control"
          >
            <option value="">Select Bus Source</option>
            {allBusSources.map((source) => (
              <option key={source} value={source}>
                {source}
              </option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label>Bus No</label>
          <select
            name="busNo"
            value={formData.busNo}
            onChange={handleInputChange}
            className="form-control"
          >
            <option value="">Select Bus No</option>
            {availableBusNos.map((busNo) => (
              <option key={busNo} value={busNo}>
                {busNo}
              </option>
            ))}
          </select>
        </div>
        <button type="button" className="btn btn-primary" onClick={handleSave}>
          Save
        </button>
        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => navigate(-1)}
        >
          Cancel
        </button>
      </form>
    </div>
  );
}

export default EditStudent;
