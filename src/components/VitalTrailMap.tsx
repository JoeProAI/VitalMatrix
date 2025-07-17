// TODO: You will need to install react-leaflet and its types:
// pnpm install react-leaflet leaflet @types/leaflet
import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import CheckIn from './CheckIn';

// Fix for default icon issue with Webpack
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

const pulseColors = {
  quiet: 'green',
  moderate: 'yellow',
  busy: 'red',
  unknown: 'gray',
};

const VitalTrailMap = () => {
  const [hospitals, setHospitals] = useState([]);
  const [pulseData, setPulseData] = useState({});
  const [selectedHospital, setSelectedHospital] = useState(null);

  useEffect(() => {
    // Fetch initial hospital and pulse data
    const fetchData = async () => {
      const hospRes = await fetch('/data/dummy_hospitals.json');
      const hospData = await hospRes.json();
      setHospitals(hospData);

      const pulseRes = await fetch('/api/get_pulse');
      const pulseData = await pulseRes.json();
      setPulseData(pulseData);
    };
    fetchData();
    
    // Refresh pulse data every 30 seconds
    const interval = setInterval(async () => {
      const pulseRes = await fetch('/api/get_pulse');
      const pulseData = await pulseRes.json();
      setPulseData(pulseData);
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const handleCheckIn = (hospitalId) => {
    setSelectedHospital(hospitalId);
  };

  return (
    <>
      <MapContainer center={[34.0522, -118.2437]} zoom={13} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        />
        {hospitals.map(hospital => {
          const pulse = pulseData[hospital.id]?.pulse || 'unknown';
          const color = pulseColors[pulse];
          const icon = new L.Icon({
              iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${color}.png`,
              shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
              iconSize: [25, 41],
              iconAnchor: [12, 41],
              popupAnchor: [1, -34],
              shadowSize: [41, 41]
          });

          return (
            <Marker key={hospital.id} position={[hospital.lat, hospital.lng]} icon={icon}>
              <Popup>
                <div className="text-black">
                  <h3 className="font-bold">{hospital.name}</h3>
                  <p>Community Pulse: <span style={{ color }}>{pulse.charAt(0).toUpperCase() + pulse.slice(1)}</span></p>
                  <p>Confidence: {pulseData[hospital.id]?.confidence || 0} reports</p>
                  <p>Last report: {pulseData[hospital.id]?.last_report_minutes} mins ago</p>
                  <button onClick={() => handleCheckIn(hospital.id)} className="mt-2 bg-blue-500 text-white p-1 rounded">Check In</button>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
      {selectedHospital && <CheckIn hospitalId={selectedHospital} onClose={() => setSelectedHospital(null)} />}
    </>
  );
};

export default VitalTrailMap;