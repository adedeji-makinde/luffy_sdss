import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, Polygon, Polyline } from 'react-leaflet';
import axios from 'axios';

const LAGOS_CENTER = [6.5244, 3.3792];

export default function MapDashboard() {
  const [students, setStudents] = useState([]);
  const [hazards, setHazards] = useState([]);
  const [busRoutes, setBusRoutes] = useState([]);
  const [atRiskIds, setAtRiskIds] = useState([]);
  const [nearestRouteData, setNearestRouteData] = useState(null);
  
  // 1. New State for the AI-generated Smart Stops
  const [smartStops, setSmartStops] = useState([]);

  useEffect(() => {
    axios.get('https://laughing-happiness-q774gxq7xq5q2x6jq-8000.app.github.dev/api/student-locations/')
      .then(res => setStudents(res.data.features || []))
      .catch(err => console.error(err));

    axios.get('https://laughing-happiness-q774gxq7xq5q2x6jq-8000.app.github.dev/api/hazard-zones/')
      .then(res => setHazards(res.data.features || []))
      .catch(err => console.error(err));

    axios.get('https://laughing-happiness-q774gxq7xq5q2x6jq-8000.app.github.dev/api/bus-routes/')
      .then(res => setBusRoutes(res.data.features || []))
      .catch(err => console.error(err));
  }, []);

  const checkHazardIntersections = () => {
    axios.get('https://laughing-happiness-q774gxq7xq5q2x6jq-8000.app.github.dev/api/student-locations/in-hazard-zones/')
      .then(res => {
        const dangerIds = res.data.features.map(student => student.id);
        setAtRiskIds(dangerIds);
      })
      .catch(err => console.error("Error calculating risk:", err));
  };

  const handleStudentClick = (studentId) => {
    setNearestRouteData(null);
    axios.get(`https://laughing-happiness-q774gxq7xq5q2x6jq-8000.app.github.dev/api/student/${studentId}/nearest-route/`)
      .then(res => setNearestRouteData(res.data))
      .catch(err => setNearestRouteData({ error: "No routes available" }));
  };

  // 2. New Function to call our K-Means AI endpoint
  const runAIOptimization = () => {
    axios.get('https://laughing-happiness-q774gxq7xq5q2x6jq-8000.app.github.dev/api/smart-stops/')
      .then(res => {
        if (res.data.smart_stops) {
          setSmartStops(res.data.smart_stops);
        }
      })
      .catch(err => {
        console.error("Error running AI:", err);
        alert(err.response?.data?.error || "Failed to generate smart stops.");
      });
  };

  const totalStudents = students.length;
  const totalAtRisk = atRiskIds.length;

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw', fontFamily: 'system-ui, sans-serif' }}>
      
      {/* Sidebar Panel */}
      <div style={{ width: '320px', backgroundColor: '#0f172a', color: 'white', display: 'flex', flexDirection: 'column', zIndex: 1000, boxShadow: '4px 0 15px rgba(0,0,0,0.5)' }}>
        <div style={{ padding: '25px 20px', borderBottom: '1px solid #1e293b' }}>
          <h1 style={{ margin: 0, fontSize: '28px', color: '#38bdf8', letterSpacing: '1px' }}>Luffy SDSS</h1>
          <p style={{ margin: '5px 0 0 0', fontSize: '13px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Spatial Decision Support
          </p>
        </div>
        
        <div style={{ padding: '20px', flexGrow: 1 }}>
          <h3 style={{ marginTop: 0, marginBottom: '20px', color: '#e2e8f0', fontSize: '16px' }}>Live Overview</h3>
          
          <div style={{ backgroundColor: '#1e293b', padding: '20px', borderRadius: '10px', marginBottom: '15px', borderLeft: '4px solid #38bdf8' }}>
            <span style={{ display: 'block', fontSize: '13px', color: '#94a3b8', marginBottom: '5px' }}>Total Enrolled Students</span>
            <span style={{ fontSize: '32px', fontWeight: 'bold' }}>{totalStudents}</span>
          </div>

          <div style={{ backgroundColor: '#1e293b', padding: '20px', borderRadius: '10px', marginBottom: '30px', borderLeft: totalAtRisk > 0 ? '4px solid #ef4444' : '4px solid #10b981' }}>
            <span style={{ display: 'block', fontSize: '13px', color: '#94a3b8', marginBottom: '5px' }}>Students at Risk</span>
            <span style={{ fontSize: '32px', fontWeight: 'bold', color: totalAtRisk > 0 ? '#ef4444' : '#f8fafc' }}>
              {totalAtRisk}
            </span>
          </div>

          <button 
            onClick={checkHazardIntersections}
            style={{
              width: '100%',
              padding: '15px', 
              backgroundColor: '#ef4444', 
              color: 'white', 
              border: 'none', 
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: '15px',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              boxShadow: '0 4px 6px rgba(239, 68, 68, 0.2)',
              marginBottom: '15px'
            }}
          >
            Run Hazard Analysis
          </button>

          {/* 3. New Button to Trigger the AI */}
          <button 
            onClick={runAIOptimization}
            style={{
              width: '100%',
              padding: '15px', 
              backgroundColor: '#fbbf24', 
              color: '#0f172a', 
              border: 'none', 
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: '15px',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              boxShadow: '0 4px 6px rgba(251, 191, 36, 0.2)'
            }}
          >
            Optimize Bus Stops (AI)
          </button>
        </div>
      </div>

      {/* Map Area */}
      <div style={{ flexGrow: 1, position: 'relative' }}>
        <MapContainer center={LAGOS_CENTER} zoom={12} style={{ height: '100%', width: '100%', zIndex: 1 }}>
          <TileLayer
            attribution='&copy; OpenStreetMap'
            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" 
          />

          {/* Render Students */}
          {students.map(student => {
            const [lng, lat] = student.geometry.coordinates;
            const isAtRisk = atRiskIds.includes(student.id);
            return (
              <CircleMarker 
                key={student.id} 
                center={[lat, lng]}
                radius={8}
                pathOptions={{ 
                  color: isAtRisk ? '#ef4444' : '#38bdf8', 
                  fillColor: isAtRisk ? '#ef4444' : '#38bdf8', 
                  fillOpacity: 0.9,
                  weight: 2
                }}
                eventHandlers={{ click: () => handleStudentClick(student.id) }}
              >
                <Popup>
                  <div style={{ fontFamily: 'system-ui, sans-serif' }}>
                    <strong style={{ display: 'block', fontSize: '14px', marginBottom: '4px' }}>
                      {student.properties.student_name}
                    </strong>
                    <div style={{ marginBottom: '8px', fontSize: '12px' }}>
                      Status: {isAtRisk ? "⚠️ At Risk" : "✅ Safe"}
                    </div>
                    <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '8px', marginTop: '8px' }}>
                      <strong style={{ fontSize: '12px', color: '#6b7280' }}>Logistics:</strong><br />
                      {!nearestRouteData ? (
                        <span style={{ fontSize: '12px', color: '#9ca3af' }}>Calculating distance...</span>
                      ) : nearestRouteData.error ? (
                        <span style={{ fontSize: '12px', color: '#ef4444' }}>{nearestRouteData.error}</span>
                      ) : (
                        <span style={{ fontSize: '12px' }}>
                          Nearest route: <strong>{nearestRouteData.nearest_route_name}</strong><br/>
                          Distance: <strong>{nearestRouteData.distance_meters}m</strong>
                        </span>
                      )}
                    </div>
                  </div>
                </Popup>
              </CircleMarker>
            );
          })}

          {/* Render Hazards */}
          {hazards.map(hazard => {
            const positions = hazard.geometry.coordinates[0].map(([lng, lat]) => [lat, lng]);
            return (
              <Polygon 
                key={hazard.id} 
                positions={positions} 
                pathOptions={{ color: '#ef4444', fillColor: '#ef4444', fillOpacity: 0.15, weight: 1, dashArray: '5, 5' }} 
              />
            );
          })}

          {/* Render Bus Routes */}
          {busRoutes.map(route => {
            const positions = route.geometry.coordinates.map(([lng, lat]) => [lat, lng]);
            return (
              <Polyline 
                key={route.id} 
                positions={positions} 
                pathOptions={{ color: '#10b981', weight: 4, opacity: 0.9 }} 
              />
            );
          })}

          {/* 4. Render the AI Smart Stops (Gold Stars/Circles) */}
          {smartStops.map(stop => (
            <CircleMarker 
              key={stop.id} 
              center={[stop.latitude, stop.longitude]}
              radius={12}
              pathOptions={{ 
                color: '#b45309', 
                fillColor: '#fbbf24', 
                fillOpacity: 1,
                weight: 3
              }}
            >
              <Popup>
                <strong>{stop.label}</strong><br />
                <em>AI-Optimized Location</em>
              </Popup>
            </CircleMarker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
}