import React, { useState,useEffect} from "react";
import axios from "axios";
import "./buscreate.css";

const BusDetailsCreate = () => {
  const [formData, setFormData] = useState({
    id:0,
    source: "",
    busRoute: "",
    columns: 3,
    data: {},
  });

  useEffect(() => {
    const fetchNextId = async () => {
      try {
        const response = await axios.get("http://localhost:3009/bus-details");
        const nextId = response.data.length + 1; // Next available id
        setFormData((prevFormData) => ({
          ...prevFormData,
          id: nextId,
        }));
      } catch (error) {
        console.error("Error fetching next id:", error);
      }
    };

    fetchNextId();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }));
  };

  const handleDataChange = (e, columnName) => {
    const { name, value } = e.target;
    setFormData((prevFormData) => ({
      ...prevFormData,
      data: {
        ...prevFormData.data,
        [columnName]: {
          ...prevFormData.data[columnName],
          [name]: value,
        },
      },
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("http://localhost:3009/bus-details", {
        id: formData.id,
        source: formData.source,
        busRoute: formData.busRoute,
        columns: formData.columns,
        data: formData.data, // Ensure that formData.data matches the expected structure
      });
      console.log("Bus added successfully:", response.data);
      setFormData({
        id: formData.id + 1, // Increment the id for the next entry
        columns: 3,
        source: "",
        busRoute: "",
        data: {}, // Reset data object
      });
    } catch (error) {
      console.error("Error adding bus:", error);
      // Add error handling here
    }
  };

  const renderColumnInputs = () => {
    const columnInputs = [];
    for (let i = 1; i <= formData.columns; i++) {
      const columnName = `column${i}`;
      columnInputs.push(
        <div
          className="container-fluid d-flex flex-column align-items-center justify-content-center text-center mb-3"
          key={columnName}
        >
          <div className="input-group mb-3">
            <label className="input-group-text">Bus No:</label>
            <input
              className="form-control"
              type="Number"
              name={`busNo${i}`}
              onChange={(e) => handleDataChange(e, columnName)}
            />
          </div>
          <div className="input-group mb-3">
            <label className="input-group-text">Driver Name:</label>
            <input
              className="form-control"
              type="text"
              name={`driver${i}`}
              onChange={(e) => handleDataChange(e, columnName)}
            />
          </div>
          <div className="input-group mb-3">
            <label className="input-group-text">Conductor Name:</label>
            <input
              className="form-control"
              type="text"
              name={`conductor${i}`}
              onChange={(e) => handleDataChange(e, columnName)}
            />
          </div>
          <div className="input-group mb-3">
            <label className="input-group-text">Total Seats:</label>
            <input
              className="form-control"
              type="number"
              name={`totalSeats${i}`}
              onChange={(e) => handleDataChange(e, columnName)}
            />
          </div>
          <div className="input-group mb-3">
            <label className="input-group-text">Seats Allocated:</label>
            <input
              className="form-control"
              type="number"
              name={`seatsAllocated${i}`}
              onChange={(e) => handleDataChange(e, columnName)}
            />
          </div>
          <div className="input-group mb-3">
            <label className="input-group-text">Vacancy:</label>
            <input
              className="form-control"
              type="number"
              name={`vacancy${i}`}
              onChange={(e) => handleDataChange(e, columnName)}
            />
          </div>
        </div>
      );
    }
    return columnInputs;
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="container bg-transparent">
        <label className="input-group">
          Source:
          <input
            type="text"
            className="form-control"
            name="source"
            value={formData.source}
            onChange={handleChange}
          />
        </label>
        <br />
        <label className="input-group">
          Bus Route:
          <input
            type="text"
            className="form-control"
            name="busRoute"
            value={formData.busRoute}
            onChange={handleChange}
          />
        </label>
        <br />
        <label className="input-group">
          Number of Columns:
          <input
            type="number"
            className="form-control"
            name="columns"
            value={formData.columns}
            onChange={handleChange}
          />
        </label>
      </div>
      {renderColumnInputs()}
      <button type="submit">Save</button>
    </form>
  );
};

export default BusDetailsCreate;