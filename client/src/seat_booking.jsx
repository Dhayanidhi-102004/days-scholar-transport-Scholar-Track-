import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';

const SeatBooking = () => {
  const location = useLocation();
  const email = location.state?.email || '';  // Get the email passed from the previous component
  const busNo = location.state?.busNo || '';  // Get the busNo passed from the previous component

  console.log('busNo:', busNo);  // Log busNo to the console

  const [seats, setSeats] = useState([]);
  const [selectedSeat, setSelectedSeat] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSeats = async () => {
      try {
        const response = await axios.get(`http://localhost:3009/bus-seats/${busNo}`);
        setSeats(response.data.seats);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSeats();
  }, [busNo]);

  const handleSeatSelection = (seatNumber) => {
    setSelectedSeat(seatNumber);
  };

  const handleBooking = async () => {
    if (!selectedSeat) {
      alert('Please select a seat before booking.');
      return;
    }

    try {
      const response = await axios.post('http://localhost:3009/book-seat', {
        email,
        busNo,
        seatNumber: selectedSeat,
      });

      if (response.status === 200) {
        alert(`Seat ${selectedSeat} booked successfully! A confirmation email has been sent.`);
      } else {
        alert('Booking failed');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  if (loading) return <p>Loading seats...</p>;
  if (error) return <p>Error: {error}</p>;
  if (!seats || seats.length === 0) return <p>No seats available for this bus.</p>;

  return (
    <div className="container mt-5">
      <h1>Seat Booking</h1>
      <div className="row">
        {seats.map((seat, index) => (
          <div key={index} className="col-3">
            <button
              className={`btn ${selectedSeat === seat.seatNumber ? 'btn-success' : 'btn-secondary'}`}
              onClick={() => handleSeatSelection(seat.seatNumber)}
              disabled={seat.isBooked}
            >
              {seat.isBooked ? `Seat ${seat.seatNumber} (Booked)` : `Seat ${seat.seatNumber}`}
            </button>
          </div>
        ))}
      </div>
      <div className="mt-3">
        <button className="btn btn-primary" onClick={handleBooking}>
          Confirm Booking
        </button>
      </div>
    </div>
  );
};

export default SeatBooking;
