import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import axios from 'axios';

const BusRouteDetails = () => {
  const { busIndex } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email || '';  
  const [busDetails, setBusDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBusDetails = async () => {
      try {
        const response = await axios.get(`http://localhost:3009/bus-details/${busIndex}`);
        setBusDetails(response.data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchBusDetails();
  }, [busIndex]);

  const handleSeatSelection = (busNo, column) => {
    console.log("Navigating to /busSeat with:", { email, busNo, column });
    navigate(`/busSeat`, { state: { email, busNo, column } });
  };
  

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;
  if (!busDetails) return <p>No details found for this bus.</p>;

  return (
    <div className="d-flex flex-column justify-content-center align-items-center mt-5">
      <div className="bg-primary w-50 text-center text-white p-2">
        <h1>Bus Route Details</h1>
      </div>
      <div className="container-fluid">
        <div className="row">
          <div className="col">
            <h2>Source: {busDetails.source}</h2>
            <div className="row">
              {Object.entries(busDetails.data).map(([column, busDetailsColumn], index) => (
                <div key={index} className="col-md-4">
                  <div className="card p-3 mb-3">
                    <h5><strong>Bus No:</strong> {busDetailsColumn.busNo}</h5>
                    <p><strong>Driver:</strong> {busDetailsColumn.driver}</p>
                    <p><strong>Conductor:</strong> {busDetailsColumn.conductor}</p>
                    <p><strong>Total Seats:</strong> {busDetailsColumn.totalSeats}</p>
                    <p><strong>Seats Allocated:</strong> {busDetailsColumn.seatsAllocated}</p>
                    <p><strong>Vacancy:</strong> {busDetailsColumn.vacancy}</p>
                    <button 
                      className="btn btn-primary mt-2 w-100" 
                      onClick={() => handleSeatSelection(busDetailsColumn.busNo, column)}>
                      Select Seat
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BusRouteDetails;
