import React, { useState, useEffect } from 'react';
import axios from 'axios';

const HolidaysPage = () => {
  const [collegeHolidays, setCollegeHolidays] = useState([]);
  const [govtHolidays, setGovtHolidays] = useState([]);
  const [newHoliday, setNewHoliday] = useState({
    date: '',
    name: '',
    type: 'college',
  });

  useEffect(() => {
    // Fetch holidays from DB on component mount
    axios
      .get('http://localhost:3009/api/holidays')
      .then((response) => {
        const holidays = response.data;
        setCollegeHolidays(
          holidays.filter((h) => h.type === 'college' || h.type === 'both')
        );
        setGovtHolidays(
          holidays.filter((h) => h.type === 'govt' || h.type === 'both')
        );
      })
      .catch((error) => console.error('Error fetching holidays:', error));
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewHoliday((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddHoliday = () => {
    if (!newHoliday.date || !newHoliday.name) {
      alert('Please fill in all fields');
      return;
    }

    axios
      .post('http://localhost:3009/api/holidays', newHoliday)
      .then((response) => {
        const addedHoliday = response.data.holiday;

        // Update state based on type
        if (addedHoliday.type === 'college' || addedHoliday.type === 'both') {
          setCollegeHolidays((prev) => [...prev, addedHoliday]);
        }
        if (addedHoliday.type === 'govt' || addedHoliday.type === 'both') {
          setGovtHolidays((prev) => [...prev, addedHoliday]);
        }

        // Reset the form
        setNewHoliday({ date: '', name: '', type: 'college' });
        alert('Holiday added successfully!');
      })
      .catch((error) => {
        console.error('Error adding holiday:', error);
        alert('Failed to add holiday');
      });
  };

  return (
    <div className="holiday-page">
      {/* Add Holiday Form */}
      <div className="add-holiday">
        <h3>Add New Holiday</h3>
        <div>
          <label>
            Date:
            <input
              type="date"
              name="date"
              value={newHoliday.date}
              onChange={handleInputChange}
            />
          </label>
        </div>
        <div>
          <label>
            Name:
            <input
              type="text"
              name="name"
              value={newHoliday.name}
              onChange={handleInputChange}
              placeholder="Enter holiday name"
            />
          </label>
        </div>
        <div>
          <label>
            Type:
            <select
              name="type"
              value={newHoliday.type}
              onChange={handleInputChange}
            >
              <option value="college">College Holiday</option>
              <option value="govt">Government Holiday</option>
              <option value="both">Both</option>
            </select>
          </label>
        </div>
        <button onClick={handleAddHoliday}>Add Holiday</button>
      </div>

      {/* Display Holidays */}
      <div className="holidays-list">
        <div className="college-holidays">
          <h3>College Holidays</h3>
          <ul>
            {collegeHolidays.map((holiday, index) => (
              <li key={index}>
                {holiday.date} - {holiday.name}
              </li>
            ))}
          </ul>
        </div>

        <div className="govt-holidays">
          <h3>Government Holidays</h3>
          <ul>
            {govtHolidays.map((holiday, index) => (
              <li key={index}>
                {holiday.date} - {holiday.name}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Styling */}
      <style>{`
        .holiday-page {
          display: flex;
          flex-direction: column;
          gap: 20px;
          padding: 20px;
        }

        .add-holiday {
          border: 1px solid #ddd;
          border-radius: 8px;
          padding: 20px;
          background-color: #f9f9f9;
        }

        .add-holiday label {
          display: block;
          margin-bottom: 10px;
        }

        .add-holiday input,
        .add-holiday select {
          padding: 8px;
          width: 100%;
          margin-top: 5px;
          margin-bottom: 15px;
          border-radius: 5px;
          border: 1px solid #ccc;
        }

        .add-holiday button {
          background-color: #007bff;
          color: white;
          padding: 10px 15px;
          border: none;
          border-radius: 5px;
          cursor: pointer;
        }

        .holidays-list {
          display: flex;
          justify-content: space-between;
          gap: 20px;
        }

        .holidays-list div {
          flex: 1;
          border: 1px solid #ddd;
          border-radius: 8px;
          padding: 20px;
          background-color: #f9f9f9;
        }

        h3 {
          margin-bottom: 15px;
        }

        ul {
          list-style-type: none;
          padding: 0;
        }

        li {
          padding: 5px 0;
        }

        @media (max-width: 768px) {
          .holidays-list {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  );
};

export default HolidaysPage;
