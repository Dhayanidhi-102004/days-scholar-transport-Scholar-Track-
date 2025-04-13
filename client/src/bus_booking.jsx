import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './bus_booking.css';
import { FaBusAlt } from "react-icons/fa";
import axios from 'axios';

const BusBooking = () => {
  const [activeButton, setActiveButton] = useState(null);
  const [busData, setBusData] = useState([]);
  const { email } = useParams(); 

  useEffect(() => {
    const fetchBusData = async () => {
      try {
        const response = await axios.get('http://localhost:3009/bus-details');
        setBusData(response.data);
      } catch (error) {
        console.error('Error fetching bus data:', error);
      }
    };

    fetchBusData();
  }, []);

  const handleButtonClick = async (index, busSource) => {
    setActiveButton(index);
  
    try {
      // Make a POST request to save the email and bus source to the database
      const result = await axios.post('http://localhost:3009/save-bus-booking', {
        email: email, // email comes from useParams
        busSource: busSource, // busSource passed as argument
      });
      
      console.log('Bus booking saved successfully', result.data);
    } catch (error) {
      console.error('Error saving bus booking:', error);
    }
  };
  

  const buttonTexts = busData.map((bus, index) => ({
    icon: <FaBusAlt />,
    image: 'image-url-1',
    title: bus.source,
    subtitle: bus.busRoute,
    index: index + 1 
  }));

  return (
    <div className='d-flex flex-column justify-content-center align-items-center mt-5'>
      <div className="bg-primary w-50 text-center">
        <h1>Bus Booking</h1>
      </div>
      <h2>Select Bus</h2>
      <div className="container-fluid">
        <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 row-cols-xl-5 g-3">
          {buttonTexts.map((button) => (
            <div className="col" key={button.index}>
              <Link 
                to={`/BusRouteDetails/${button.index}`} 
                state={{ email, busSource: button.title }} 
                className="text-decoration-none"
              >
                <button
                  className={`btn box w-100 ${activeButton === button.index ? 'active' : ''}`}
                  onClick={() => handleButtonClick(button.index, button.title)}
                >
                  <span className="d-block text-center">{button.icon}</span>
                  <span className="d-block font-weight-bold text-center">{button.title.toUpperCase()}</span>
                  <span className="d-block text-center">{button.subtitle}</span>
                </button>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BusBooking;
