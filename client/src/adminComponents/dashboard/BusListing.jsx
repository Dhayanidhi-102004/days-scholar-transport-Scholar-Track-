import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const BusListing = () => {
  const [busdata, busdatachange] = useState(null);
  const navigate = useNavigate();

  const LoadDetail = (id) => {
    navigate("/bus/detail/" + id);
  };

  const LoadEdit = (id) => {
    navigate("/bus/edit/" + id);
  };

  const Removefunction = (id) => {
    if (window.confirm("Do you want to remove?")) {
      fetch("http://localhost:8000/bus/" + id, {
        method: "DELETE",
      })
        .then((res) => {
          alert("Removed successfully.");
          window.location.reload();
        })
        .catch((err) => {
          console.log(err.message);
        });
    }
  };

  useEffect(() => {
    fetch("http://localhost:8000/bus")
      .then((res) => {
        return res.json();
      })
      .then((resp) => {
        busdatachange(resp);
      })
      .catch((err) => {
        console.log(err.message);
      });
  }, []);

  return (
    <div className="container">
      <div className="card">
        <div className="card-title">
          <h2>Bus Listing</h2>
        </div>
        <div className="card-body">
          <div className="divbtn">
            <Link to="bus/create" className="btn btn-success">
              Add New (+)
            </Link>
          </div>
          <table className="table table-bordered">
            <thead className="bg-dark text-white">
              <tr>
                <td>Source</td>
                <td>Bus Route</td>
                <td>Action</td>
              </tr>
            </thead>
            <tbody>
              {busdata &&
                busdata.map((item) => (
                  <tr key={item.id}>
                    <td>{item.source}</td>
                    <td>{item.busRoute}</td>
                    <td>
                      <a
                        onClick={() => {
                          LoadEdit(item.id);
                        }}
                        className="btn btn-success"
                      >
                        Edit
                      </a>
                      <a
                        onClick={() => {
                          Removefunction(item.id);
                        }}
                        className="btn btn-danger"
                      >
                        Remove
                      </a>
                      <a
                        onClick={() => {
                          LoadDetail(item.id);
                        }}
                        className="btn btn-primary"
                      >
                        Details
                      </a>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default BusListing;
