import React, { useEffect, useMemo, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const DEFAULT_CENTER = [0.3476, 32.5825];

const toNumber = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const parseWktPoint = (value) => {
  if (typeof value !== 'string') {
    return { lat: null, lng: null };
  }

  const match = value.trim().match(/^POINT\s*\(\s*([-\d.]+)\s+([-\d.]+)\s*\)$/i);
  if (!match) {
    return { lat: null, lng: null };
  }

  return { lng: toNumber(match[1]), lat: toNumber(match[2]) };
};

const getCoordinates = (agent) => {
  let lat = toNumber(agent.geo_lat);
  let lng = toNumber(agent.geo_long);

  if (lat === null || lng === null) {
    const parsed = parseWktPoint(agent.location);
    lat = parsed.lat;
    lng = parsed.lng;
  }

  if (lat === null || lng === null) {
    return null;
  }

  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
    return null;
  }

  return { lat, lng };
};

function AgentMap({ agents }) {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const markersLayerRef = useRef(null);

  const points = useMemo(
    () =>
      agents
        .map((agent) => {
          const coordinates = getCoordinates(agent);
          if (!coordinates) {
            return null;
          }

          return {
            id: agent.id,
            name: agent.name || 'Unnamed agent',
            status: agent.status || 'unknown',
            ...coordinates,
          };
        })
        .filter(Boolean),
    [agents]
  );

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) {
      return undefined;
    }

    const map = L.map(mapContainerRef.current, {
      zoomControl: true,
      scrollWheelZoom: true,
    }).setView(DEFAULT_CENTER, 5);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(map);

    const markersLayer = L.layerGroup().addTo(map);

    mapRef.current = map;
    markersLayerRef.current = markersLayer;

    return () => {
      map.remove();
      mapRef.current = null;
      markersLayerRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!mapRef.current || !markersLayerRef.current) {
      return;
    }

    const map = mapRef.current;
    const markersLayer = markersLayerRef.current;
    markersLayer.clearLayers();

    points.forEach((point) => {
      const marker = L.circleMarker([point.lat, point.lng], {
        radius: 8,
        color: '#24a8ff',
        weight: 2,
        fillColor: '#59f2c6',
        fillOpacity: 0.8,
      });

      marker.bindPopup(`${point.name} (${point.status})`);
      marker.addTo(markersLayer);
    });

    if (points.length === 0) {
      map.setView(DEFAULT_CENTER, 5);
      return;
    }

    if (points.length === 1) {
      map.setView([points[0].lat, points[0].lng], 11);
      return;
    }

    const bounds = L.latLngBounds(points.map((point) => [point.lat, point.lng]));
    map.fitBounds(bounds.pad(0.25));
  }, [points]);

  return <div ref={mapContainerRef} style={{ height: '100%', width: '100%' }} />;
}

export default AgentMap;
