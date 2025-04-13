import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useLocation } from 'react-router-dom';

const columnStyle = {
  padding: '20px',
  border: '1px solid #ddd',
  margin: '20px 0',
  borderRadius: '5px',
  backgroundColor: '#f9f9f9',
  width: '300px',
  textAlign: 'left',
};

const BusDetailsEditPage = () => {
  const [busDetails, setBusDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const location = useLocation();
  const selectedBusID = location.state?.selectedBusID;  // Access the selectedBusID passed via state

  useEffect(() => {
    if (selectedBusID) {
      const fetchBusDetails = async () => {
        try {
          const response = await axios.get(`http://localhost:3009/bus-details/${selectedBusID}`);
          setBusDetails(response.data);
        } catch (error) {
          console.error('Error fetching bus details:', error);
        }
      };

      fetchBusDetails();
    }
  }, [selectedBusID]);

  const handleInputChange = (columnKey, field, value) => {
    setBusDetails((prevDetails) => ({
      ...prevDetails,
      data: {
        ...prevDetails.data,
        [columnKey]: {
          ...prevDetails.data[columnKey],
          [field]: value,
        },
      },
    }));
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const response = await axios.put(`http://localhost:3009/bus-details/${selectedBusID}`, busDetails);
      console.log('Saved bus details:', response.data);
      alert('Bus details saved successfully!');
    } catch (error) {
      console.error('Error saving bus details:', error);
      alert('Failed to save bus details. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!busDetails) {
    return <div>Loading...</div>;
  }

  if (!busDetails.data) {
    return <div>No bus details data available.</div>;
  }

  return (
    <div>
      <h2>Edit Bus ID: {selectedBusID}</h2>
      {Object.entries(busDetails.data).map(([columnKey, column], index) => (
        <div key={index} style={columnStyle}>
          <label>
            Bus No:
            <input
              type="text"
              value={column.busNo}
              onChange={(e) =>
                handleInputChange(columnKey, 'busNo', e.target.value)
              }
            />
          </label>
          <br />
          <label>
            Driver:
            <input
              type="text"
              value={column.driver}
              onChange={(e) =>
                handleInputChange(columnKey, 'driver', e.target.value)
              }
            />
          </label>
          <br />
          <label>
            Conductor:
            <input
              type="text"
              value={column.conductor}
              onChange={(e) =>
                handleInputChange(columnKey, 'conductor', e.target.value)
              }
            />
          </label>
          <br />
          <label>
            Total Seats:
            <input
              type="number"
              value={column.totalSeats}
              onChange={(e) =>
                handleInputChange(columnKey, 'totalSeats', e.target.value)
              }
            />
          </label>
          <br />
          <label>
            Seats Allocated:
            <input
              type="number"
              value={column.seatsAllocated}
              onChange={(e) =>
                handleInputChange(columnKey, 'seatsAllocated', e.target.value)
              }
            />
          </label>
          <br />
          <label>
            Vacancy:
            <input
              type="number"
              value={column.vacancy}
              onChange={(e) =>
                handleInputChange(columnKey, 'vacancy', e.target.value)
              }
            />
          </label>
          <br />
          <label>
            Status:
            <input
              type="text"
              value={column.status}
              onChange={(e) =>
                handleInputChange(columnKey, 'status', e.target.value)
              }
            />
          </label>
        </div>
      ))}
      <button onClick={handleSave} className="btn btn-primary" style={{ marginTop: '20px' }} disabled={isLoading}>
        {isLoading ? 'Saving...' : 'Save'}
      </button>
    </div>
  );
};

export default BusDetailsEditPage;
