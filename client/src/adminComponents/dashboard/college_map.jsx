import React, { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import axios from 'axios';
import openrouteservice from 'openrouteservice-js';

// Fix for default marker icons
L.Icon.Default.mergeOptions({
  iconRetinaUrl: new URL('leaflet/dist/images/marker-icon-2x.png', import.meta.url).href,
  iconUrl: new URL('leaflet/dist/images/marker-icon.png', import.meta.url).href,
  shadowUrl: new URL('leaflet/dist/images/marker-shadow.png', import.meta.url).href
});

const busIcon = new L.Icon({
  iconUrl: 'https://freepngimg.com/thumb/map/69579-map-icons-symbol-wallpaper-desktop-computer-location.png',
  iconSize: [35, 35],
  iconAnchor: [17, 35]
});

const directions = new openrouteservice.Directions({ api_key: '5b3ce3597851110001cf62486039c411f0944c4091e074c3857ad813' });
const CollegeMap = () => {
  const [buses, setBuses] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBus, setSelectedBus] = useState(null);
  const [fromStop, setFromStop] = useState(null);
  const [toStop, setToStop] = useState(null);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [sourceInput, setSourceInput] = useState('');
  const [routePolyline, setRoutePolyline] = useState([]);
  const mapRef = useRef();

  useEffect(() => {
    axios.get('http://localhost:3009/api/buses')
      .then(response => setBuses(response.data))
      .catch(error => console.error('Error fetching bus data:', error));
  }, []);

  const filteredBuses = searchTerm
    ? buses.filter(bus => String(bus.busNo).includes(searchTerm))
    : buses;

  const handleLocateBus = (bus) => {
    if (bus?.currentLocation) {
      mapRef.current?.setView([bus.currentLocation.latitude, bus.currentLocation.longitude], 15);
      setSelectedBus(bus);
    }
  };
  const getRealRoute = async (startCoords, endCoords) => {
    try {
      const response = await axios.post(
        'https://api.openrouteservice.org/v2/directions/driving-car/geojson',
        {
          coordinates: [
            [startCoords[1], startCoords[0]], // [lng, lat]
            [endCoords[1], endCoords[0]]
          ]
        },
        {
          headers: {
            Authorization: '5b3ce3597851110001cf62486039c411f0944c4091e074c3857ad813',
            'Content-Type': 'application/json'
          }
        }
      );
  
      const coordinates = response.data.features[0].geometry.coordinates;
      // Convert [lng, lat] to [lat, lng] for Leaflet
      const leafletCoords = coordinates.map(coord => [coord[1], coord[0]]);
      setRoutePolyline(leafletCoords);
    } catch (error) {
      console.error('Error fetching realistic route:', error);
    }
  };
  

  const handleDirections = async () => {
    if (fromStop && toStop) {
      try {
        const response = await directions.calculate({
          coordinates: [fromStop.reverse(), toStop.reverse()], // ORS expects [lng, lat]
          profile: 'driving-car',
          format: 'geojson'
        });
  
        const routeCoords = response.features[0].geometry.coordinates.map(coord => [coord[1], coord[0]]);
        setRoutePolyline(routeCoords);
        mapRef.current?.fitBounds(routeCoords);
      } catch (err) {
        console.error("Route error:", err);
        alert("Could not fetch driving route.");
      }
    }
  };

  const handleLocateMe = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(position => {
        const pos = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        setCurrentLocation(pos);
        mapRef.current?.setView([pos.lat, pos.lng], 15);
      }, (error) => {
        console.error('Error getting location:', error);
      });
    }
  };

  const handleSourceRoute = async () => {
    try {
      const response = await axios.post('http://localhost:3009/api/bus-coordinates', {
        source: sourceInput
      });
  
      const { from, to } = response.data;
      console.log("Coordinates from backend:", { from, to });
  
      if (from && to && from.lat && from.lng && to.lat && to.lng) {
        const fromCoords = [from.lat, from.lng];
        const toCoords = [to.lat, to.lng];
        console.log("Parsed fromCoords:", fromCoords);
        console.log("Parsed toCoords:", toCoords);
  
        setFromStop(fromCoords);
        setToStop(toCoords);
        getRealRoute(fromCoords, toCoords); // Fetch route from API
        
      } else {
        console.warn("Invalid coordinates:", { from, to });
        alert('Invalid coordinates for this source.');
      }
    } catch (error) {
      console.error('Error fetching coordinates:', error);
      alert('Source not found or server error.');
    }
  };
  
  

  // Get unique stops for dropdowns
  const allStops = buses.flatMap(bus => 
    Array.isArray(bus.stoppings) ? bus.stoppings : []
  ).filter((stop, index, self) =>
    index === self.findIndex(s => 
      s.stopName === stop.stopName && 
      s.latitude === stop.latitude && 
      s.longitude === stop.longitude
    )
  );

  return (
    <div>
      {/* Control Panel */}
      <div style={{ padding: 10, backgroundColor: '#f4f4f4', display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <input
          type="text"
          placeholder="Search Bus No"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button onClick={() => handleLocateBus(filteredBuses[0])}>Locate Bus</button>
        <button onClick={handleLocateMe}>📍 Locate Me</button>

        <select 
          value={fromStop ? `${fromStop[0]},${fromStop[1]}` : ''}
          onChange={(e) => {
            const [lat, lng] = e.target.value.split(',').map(Number);
            if (!isNaN(lat)) setFromStop([lat, lng]);
          }}
        >
          <option value="">From Stop</option>
          {allStops.map((stop, i) => (
            <option key={`from-${i}`} value={`${stop.latitude},${stop.longitude}`}>
              {stop.stopName}
            </option>
          ))}
        </select>

        <select 
          value={toStop ? `${toStop[0]},${toStop[1]}` : ''}
          onChange={(e) => {
            const [lat, lng] = e.target.value.split(',').map(Number);
            if (!isNaN(lat)) setToStop([lat, lng]);
          }}
        >
          <option value="">To Stop</option>
          {allStops.map((stop, i) => (
            <option key={`to-${i}`} value={`${stop.latitude},${stop.longitude}`}>
              {stop.stopName}
            </option>
          ))}
        </select>

        <button onClick={handleDirections}>Get Directions</button>

        <input
          type="text"
          placeholder="Enter Source Name"
          value={sourceInput}
          onChange={(e) => setSourceInput(e.target.value)}
        />
        <button onClick={handleSourceRoute}>Route From Source</button>
      </div>

      {/* Map Container */}
      <div style={{ height: '90vh', width: '100%' }}>
        <MapContainer
          center={[11.585, 77.213]}
          zoom={12}
          scrollWheelZoom={true}
          whenCreated={map => mapRef.current = map}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; OpenStreetMap contributors'
            url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
          />
          {routePolyline.length > 0 && (
  <Polyline positions={routePolyline} color="green" />
)}


          {filteredBuses.map(bus => (
            <React.Fragment key={bus._id}>
              {Array.isArray(bus.stoppings) && bus.stoppings.map((stop, index) => (
                <Marker
                  key={`stop-${bus._id}-${index}`}
                  position={[stop.latitude, stop.longitude]}
                >
                  <Popup>
                    <strong>{stop.stopName}</strong>
                  </Popup>
                </Marker>
              ))}

              {Array.isArray(bus.stoppings) && bus.stoppings.length > 1 && (
                <Polyline
                  positions={bus.stoppings.map(stop => [stop.latitude, stop.longitude])}
                  color='red'
                />
              )}

              {bus.currentLocation && (
                <Marker
                  position={[bus.currentLocation.latitude, bus.currentLocation.longitude]}
                  icon={busIcon}
                >
                  <Popup>
                    <strong>{bus.busNo}</strong><br />
                    {bus.driver?.name && `Driver: ${bus.driver.name}`}<br />
                    {bus.driver?.phone && `Phone: ${bus.driver.phone}`}
                  </Popup>
                </Marker>
              )}
            </React.Fragment>
          ))}

          {Array.isArray(fromStop) && fromStop.length === 2 &&
           Array.isArray(toStop) && toStop.length === 2 &&
           !fromStop.includes(undefined) && !toStop.includes(undefined) && (
            <Polyline 
              positions={[fromStop, toStop]} 
              color="blue" 
              dashArray="4" 
            />
          )}

          {currentLocation && (
            <Marker position={[currentLocation.lat, currentLocation.lng]}>
              <Popup>You are here</Popup>
            </Marker>
          )}
        </MapContainer>
      </div>
    </div>
  );
};

export default CollegeMap;
