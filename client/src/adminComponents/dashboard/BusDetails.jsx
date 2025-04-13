import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function BusDetails() {
  const [busData, setBusData] = useState([]);
  const [showDeletePopup, setShowDeletePopup] = useState(null);
  const [selectedBusID, setSelectedBusID] = useState(null);
  const navigate = useNavigate();

  // Fetch bus data
  useEffect(() => {
    axios
      .get('http://localhost:3009/bus-details')
      .then((response) => {
        setBusData(response.data);
      })
      .catch((error) => {
        console.error('Error fetching bus data:', error);
      });
  }, []);

  const handleEdit = (busID, e) => {
    e.stopPropagation(); // Prevent parent onClick from triggering
    navigate('/BusDetailsEdit', { state: {selectedBusID: busID } }); // Pass busID to the next page
  };

  const handleCreate = () => {
    navigate('/busCreate'); // Navigate to create page
  };

  const handleDelete = (busID) => {
    axios
      .delete(`http://localhost:3009/bus-details/${busID}`)
      .then((response) => {
        console.log('Bus deleted successfully:', busID);
        const updatedBusData = busData.filter((bus) => bus.id !== busID);
        setBusData(updatedBusData);
        setShowDeletePopup(null);
      })
      .catch((error) => {
        console.error('Error deleting bus:', error);
      });
  };

  const handleCancelDelete = () => {
    setShowDeletePopup(null); // Close the delete confirmation popup
  };

  return (
    <div className="main-container">
      <div className="main-title mb-4">
        <h3>Bus Details</h3>
        <button className="btn btn-primary" style={{ width: '200px' }} onClick={handleCreate}>
          Create & Add another
        </button>
      </div>

      <div className="row">
        {busData.map((bus) => (
          <div
            key={bus.id}
            className="col-12 col-md-6 col-lg-4 bus-card"
            onClick={() => {}}
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
                  onClick={(e) => handleEdit(bus.id, e)} // Pass event and bus id
                >
                  Edit
                </button>

                <button
                  className="btn btn-danger"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowDeletePopup(bus.id); // Show delete confirmation popup
                  }}
                >
                  Delete
                </button>
              </div>
            </div>

            {showDeletePopup === bus.id && (
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
                    <button
                      className="btn btn-danger"
                      onClick={() => handleDelete(bus.id)} // Delete bus by ID
                    >
                      OK
                    </button>
                    <button className="btn btn-secondary" onClick={handleCancelDelete}>
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
