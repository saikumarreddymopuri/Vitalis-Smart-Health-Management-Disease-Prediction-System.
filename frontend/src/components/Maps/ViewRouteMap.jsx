// src/components/Maps/ViewRouteMap.jsx

import React, { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-routing-machine/dist/leaflet-routing-machine.css";
import "leaflet-routing-machine";

const ViewRouteMap = ({ userCoords, hospitalCoords }) => {
  const mapRef = useRef(null); // To store the map instance
  const mapContainerRef = useRef(null); // To access DOM

  useEffect(() => {
    if (!userCoords || !hospitalCoords || !mapContainerRef.current) return;

    // 🧽 Destroy existing map if already initialized
    if (mapRef.current) {
      mapRef.current.remove();
      mapRef.current = null;
    }

    // 🌍 Initialize the map
    const map = L.map(mapContainerRef.current).setView(
      [userCoords.lat, userCoords.lng],
      13
    );

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap contributors",
    }).addTo(map);

    // ➡️ Add route
    L.Routing.control({
      waypoints: [
        L.latLng(userCoords.lat, userCoords.lng),
        L.latLng(hospitalCoords.lat, hospitalCoords.lng),
      ],
      routeWhileDragging: false,
      createMarker: function (i, wp) {
        return L.marker(wp.latLng, {
          icon: L.icon({
            iconUrl:
              i === 0
                ? "https://cdn-icons-png.flaticon.com/512/684/684908.png"
                : "https://cdn-icons-png.flaticon.com/512/484/484167.png",
            iconSize: [30, 30],
          }),
        });
      },
    }).addTo(map);

    // Store map reference
    mapRef.current = map;

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [userCoords, hospitalCoords]);

  return (
    <div
      ref={mapContainerRef}
      style={{
        height: "400px",
        width: "100%",
        borderRadius: "10px",
        marginTop: "20px",
      }}
    />
  );
};

export default ViewRouteMap;














































































































// import React, { useEffect } from "react";
// import L from "leaflet";
// import "leaflet/dist/leaflet.css";
// import "leaflet-routing-machine/dist/leaflet-routing-machine.css";
// import "leaflet-routing-machine";

// const ViewRouteMap = ({ userCoords, hospitalCoords }) => {
//   useEffect(() => {
//     if (!userCoords || !hospitalCoords) return;

//     const map = L.map("map-route").setView([userCoords.lat, userCoords.lng], 13);

//     // Add OpenStreetMap tiles
//     L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
//       attribution: '&copy; OpenStreetMap contributors',
//     }).addTo(map);

//     // Add route
//     L.Routing.control({
//       waypoints: [
//         L.latLng(userCoords.lat, userCoords.lng),
//         L.latLng(hospitalCoords.lat, hospitalCoords.lng),
//       ],
//       routeWhileDragging: false,
//       createMarker: function(i, wp, nWps) {
//         return L.marker(wp.latLng, {
//           icon: L.icon({
//             iconUrl:
//               i === 0
//                 ? "https://cdn-icons-png.flaticon.com/512/684/684908.png"
//                 : "https://cdn-icons-png.flaticon.com/512/484/484167.png",
//             iconSize: [30, 30],
//           }),
//         });
//       },
//     }).addTo(map);

//     // Cleanup on unmount
//     return () => {
//       map.remove();
//     };
//   }, [userCoords, hospitalCoords]);

//   return (
//     <div
//       id="map-route"
//       style={{ height: "400px", width: "100%", borderRadius: "8px", marginTop: "20px" }}
//     ></div>
//   );
// };

// export default ViewRouteMap;
