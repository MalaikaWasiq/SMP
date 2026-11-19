import React from 'react';
import { Platform, View } from 'react-native';
import { WebView } from 'react-native-webview';

function mapHtml(routeDay, customUserLocation = null) {
  const inPakistan = (latitude, longitude) => Number.isFinite(latitude) && Number.isFinite(longitude)
    && latitude >= 23.4 && latitude <= 37.2 && longitude >= 60.8 && longitude <= 77.9;

  const rawRoute = (routeDay?.coordinates || []).map(([longitude, latitude]) => [latitude, longitude]);
  const route = rawRoute.filter(([latitude, longitude]) => inPakistan(latitude, longitude));

  const markers = (routeDay?.activities || [])
    .map((item, index) => ({ ...item, itineraryIndex: index + 1 }))
    .filter((item) => inPakistan(item.latitude, item.longitude))
    .map((item) => ({
      index: item.itineraryIndex,
      label: item.place || `Stop ${item.itineraryIndex}`,
      time: item.time || '',
      lat: Number(item.latitude),
      lon: Number(item.longitude),
    }));

  const data = JSON.stringify({
    route,
    markers,
    status: routeDay?.status,
    userLocation: customUserLocation || null,
  }).replace(/</g, '\\u003c');

  return `<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no">
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" crossorigin="">
  <style>
    html, body, #map { height: 100%; width: 100%; margin: 0; padding: 0; }
    body { background: #eaf1ea; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; overflow: hidden; }
    .leaflet-control-attribution { font-size: 9px; background: rgba(255,255,255,0.7); }
    .marker-pin {
      background: #174f36;
      color: #ffffff;
      border: 2px solid #ffffff;
      border-radius: 50%;
      width: 28px;
      height: 28px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 900;
      font-size: 12px;
      box-shadow: 0 3px 6px rgba(0,0,0,0.35);
      text-align: center;
      line-height: 24px;
    }
    .user-pulse-marker {
      background: #2563eb;
      width: 18px;
      height: 18px;
      border-radius: 50%;
      border: 3px solid #ffffff;
      box-shadow: 0 0 12px rgba(37,99,235,0.75);
    }
    .leaflet-popup-content-wrapper { border-radius: 12px; padding: 4px; box-shadow: 0 4px 14px rgba(0,0,0,0.18); }
    .popup-title { font-weight: 800; font-size: 13px; color: #153226; margin-bottom: 2px; }
    .popup-time { font-size: 11px; color: #5a7366; font-weight: 600; }
  </style>
</head>
<body>
<div id="map"></div>
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js" crossorigin=""></script>
<script>
  try {
    const data = ${data};
    const map = L.map('map', { zoomControl: true });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    if (data.route && data.route.length > 1) {
      L.polyline(data.route, {
        color: '#174f36',
        weight: 5,
        opacity: 0.88,
        dashArray: data.status === 'live' ? null : '8 8',
        lineJoin: 'round',
        lineCap: 'round'
      }).addTo(map);
    } else if (data.markers && data.markers.length > 1) {
      const markerLines = data.markers.map(m => [m.lat, m.lon]);
      L.polyline(markerLines, {
        color: '#174f36',
        weight: 4,
        opacity: 0.75,
        dashArray: '7 7',
        lineJoin: 'round'
      }).addTo(map);
    }

    data.markers.forEach(m => {
      const icon = L.divIcon({
        className: '',
        html: '<div class="marker-pin">' + m.index + '</div>',
        iconSize: [28, 28],
        iconAnchor: [14, 14]
      });
      const popupContent = '<div class="popup-title">' + m.index + '. ' + m.label.replace(/[<>]/g, '') + '</div>'
        + (m.time ? '<div class="popup-time">' + m.time + '</div>' : '');
      L.marker([m.lat, m.lon], { icon: icon }).addTo(map).bindPopup(popupContent);
    });

    const allPoints = (data.route && data.route.length) ? data.route : data.markers.map(m => [m.lat, m.lon]);

    // Live Geolocation Handling (Real-Time Location)
    function renderUserLocation(lat, lon, accuracy) {
      const userIcon = L.divIcon({
        className: '',
        html: '<div class="user-pulse-marker"></div>',
        iconSize: [18, 18],
        iconAnchor: [9, 9]
      });
      L.marker([lat, lon], { icon: userIcon, zIndexOffset: 1000 })
        .addTo(map)
        .bindPopup('<div class="popup-title">[Current Location]</div><div class="popup-time">Real-time user position</div>');
      if (accuracy) {
        L.circle([lat, lon], { radius: Math.min(accuracy / 2, 5000), color: '#3b82f6', fillOpacity: 0.12, weight: 1.5 }).addTo(map);
      }
    }

    if (data.userLocation && data.userLocation.latitude && data.userLocation.longitude) {
      renderUserLocation(data.userLocation.latitude, data.userLocation.longitude, data.userLocation.accuracy || 100);
      if (!allPoints.length) {
        map.setView([data.userLocation.latitude, data.userLocation.longitude], 12);
      }
    } else {
      map.locate({ setView: false, maxZoom: 14, enableHighAccuracy: true });
      map.on('locationfound', function(e) {
        renderUserLocation(e.latlng.lat, e.latlng.lng, e.accuracy);
        if (!allPoints.length) {
          map.setView(e.latlng, 12);
        }
      });
      map.on('locationerror', function() {
        if (!allPoints.length) {
          map.setView([30.3753, 69.3451], 6);
        }
      });
    }

    if (allPoints.length) {
      map.fitBounds(allPoints, { padding: [35, 35], maxZoom: 15 });
    }

    setTimeout(() => { map.invalidateSize(); }, 250);
  } catch (err) {
    console.error('Leaflet initialization error:', err);
  }
</script>
</body>
</html>`;
}

export default function OpenStreetMap({ routeDay, userLocation = null, height = 320 }) {
  const html = mapHtml(routeDay, userLocation);
  if (Platform.OS === 'web') {
    return React.createElement('iframe', {
      title: 'OpenStreetMap itinerary route and live location',
      srcDoc: html,
      style: { width: '100%', height, border: 0, display: 'block', backgroundColor: '#eaf1ea' },
    });
  }
  return <View style={{ height }}><WebView source={{ html }} originWhitelist={['*']} style={{ flex: 1 }} /></View>;
}
