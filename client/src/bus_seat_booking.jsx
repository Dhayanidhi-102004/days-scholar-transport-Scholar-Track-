import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import "./BusSeatBooking.css";

const BusSeatBooking = () => {
  const totalSeats = 50;
  const rows = totalSeats / 5;
  const location = useLocation();
  const navigate = useNavigate();
  const { email, busNo, column } = location.state || {};
  const [selectedSeat, setSelectedSeat] = useState(null);
  const [bookedSeats, setBookedSeats] = useState([]);

  useEffect(() => {
    // Fetch already booked seats
    const fetchBookedSeats = async () => {
      try {
        const response = await axios.get(`http://localhost:3009/booked-seats`, {
          params: { busNo }
        });
        setBookedSeats(response.data);
      } catch (error) {
        console.error("Error fetching booked seats:", error);
      }
    };

    fetchBookedSeats();
  }, [busNo]);

  // Handle Seat Selection (Only one allowed)
  const handleSeatSelection = (seatNumber) => {
    if (!bookedSeats.includes(seatNumber)) {
      setSelectedSeat(seatNumber);
    }
  };

  const handleConfirm = async () => {
    if (!selectedSeat) {
      alert("Please select a seat!");
      return;
    }

    try {
      await axios.post("http://localhost:3009/save-seat", {
        email,
        busNo,
        column,
        seatNumber: selectedSeat
      });

      alert("Seat selection successful! Confirmation email sent.");
      navigate(`/confirmation/${busNo}`);
    } catch (error) {
      console.error("Error saving seat:", error);
    }
  };

  return (
    <div className="seat-booking-container">
      <h1>Select Your Seat</h1>
      <div className="seats-grid">
        {[...Array(rows)].map((_, rowIndex) => (
          <div className="seat-row" key={rowIndex}>
            {[1, 2, 3, "spacer", 4, 5].map((colIndex) => {
              if (colIndex === "spacer") return <div key="spacer" className="spacer"></div>;
              const seatNumber = rowIndex * 5 + colIndex;
              if (seatNumber > totalSeats) return null;

              return (
                <div
                  key={seatNumber}
                  className={`seat 
                    ${bookedSeats.includes(seatNumber) ? "booked" : ""}
                    ${selectedSeat === seatNumber ? "selected" : ""}
                  `}
                  onClick={() => handleSeatSelection(seatNumber)}
                >
                  {seatNumber}
                </div>
              );
            })}
          </div>
        ))}
      </div>
      <button className="btn btn-success mt-3" onClick={handleConfirm}>
        Confirm Seat
      </button>
    </div>
  );
};

export default BusSeatBooking;
