import { VisitedArea } from './visitedArea';

const geocaches = [
  { position: { lat: 56.9475, lng: 24.1064 }, title: 'Geocache 1' },
  { position: { lat: 56.9510, lng: 24.1142 }, title: 'Geocache 2' },
];

let userMarker;
let overlay;
const visitedArea = new VisitedArea();

function initMap() {
  const riga = { lat: 56.9496, lng: 24.1052 };

  const map = new google.maps.Map(document.getElementById('map'), {
    center: riga,
    zoom: 12,
  });

  // Initialize geocache markers (hidden by default)
  geocaches.forEach((geocache) => {
    geocache.marker = new google.maps.Marker({
      position: geocache.position,
      map,
      title: geocache.title,
      visible: false,
    });
  });

  // Create overlay to hide unvisited areas
  const bounds = new google.maps.LatLngBounds(
    new google.maps.LatLng(-85, -180),
    new google.maps.LatLng(85, 180)
  );

  const ne = bounds.getNorthEast();
  const sw = bounds.getSouthWest();

  const overlayCoords = [
    new google.maps.LatLng(57.2, 23.8),
    new google.maps.LatLng(57.2, 24.4),
    new google.maps.LatLng(56.8, 24.4),
    new google.maps.LatLng(56.8, 23.8),
  ];

  overlay = new google.maps.Polygon({
    paths: [overlayCoords, visitedArea.getEdgePoints()],
    map,
    fillColor: '#000',
    fillOpacity: 0.5,
  });

  // Show user's current location and update visited area
  if (navigator.geolocation) {
    navigator.geolocation.watchPosition(
      (position) => {
        const userLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };

        if (!userMarker) {
          userMarker = new google.maps.Marker({
            position: userLocation,
            map,
            icon: 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png', // Blue marker for user's location
            title: 'Your Location',
          });
        } else {
          userMarker.setPosition(userLocation);
        }

        // Update visited area
      visitedArea.updateEdgePoints(userLocation, 100); // 100-meter radius

      // Reverse the winding order of the inner polygon (visited area)
      const visitedAreaEdgePoints = visitedArea.getEdgePoints().slice().reverse();

      console.log("visitedAreaEdgePoints", visitedAreaEdgePoints.toString());
      overlay.setPaths([overlayCoords, visitedAreaEdgePoints]);

        // Update geocache visibility based on user's distance
        geocaches.forEach((geocache) => {
          const distance = google.maps.geometry.spherical.computeDistanceBetween(
            new google.maps.LatLng(userLocation),
            new google.maps.LatLng(geocache.position)
          );

          geocache.marker.setVisible(distance <= 100);
        });
      },
      () => {
        handleLocationError(true, map);
      },
      { enableHighAccuracy: true, maximumAge: 0 }
    );
  } else {
    // Browser doesn't support Geolocation
    handleLocationError(false, map);
  }
}

function handleLocationError(browserHasGeolocation, map) {
  alert(
    browserHasGeolocation
      ? 'Error: The Geolocation service failed.'
      : 'Error: Your browser doesn\'t support geolocation.'
  );
}

window.initMap = initMap;
window.addEventListener('load', initMap);