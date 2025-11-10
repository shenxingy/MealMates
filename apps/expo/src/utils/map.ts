import type { Coordinates } from "expo-maps/src/shared.types";

export const calculateZoomLevel = (coordinates: Coordinates[]): number => {
  if (coordinates.length === 0) {
    return 15;
  }

  if (coordinates.length === 1) {
    return 17;
  }

  // Find the bounds of all coordinates
  const firstCoord = coordinates[0];
  let minLat = firstCoord?.latitude ?? 0;
  let maxLat = firstCoord?.latitude ?? 0;
  let minLng = firstCoord?.longitude ?? 0;
  let maxLng = firstCoord?.longitude ?? 0;

  for (const coord of coordinates) {
    if (coord.latitude !== undefined && coord.longitude !== undefined) {
      minLat = Math.min(minLat, coord.latitude);
      maxLat = Math.max(maxLat, coord.latitude);
      minLng = Math.min(minLng, coord.longitude);
      maxLng = Math.max(maxLng, coord.longitude);
    }
  }

  const latSpan = maxLat - minLat;
  const lngSpan = maxLng - minLng;
  const maxSpan = Math.max(latSpan, lngSpan);

  let zoom: number;

  if (maxSpan >= 40) {
    zoom = 2;
  } else if (maxSpan >= 5) {
    zoom = 7;
  } else if (maxSpan >= 2) {
    zoom = 9;
  } else if (maxSpan >= 1) {
    zoom = 11;
  } else if (maxSpan >= 0.5) {
    zoom = 13;
  } else if (maxSpan >= 0.1) {
    zoom = 15;
  } else if (maxSpan >= 0.05) {
    zoom = 16;
  } else if (maxSpan >= 0.01) {
    zoom = 17;
  } else {
    zoom = 18;
  }

  return zoom;
}

export const calculateCenterCoordinates = (coordinates: Coordinates[]): Coordinates | null => {
  if (coordinates.length === 0) {
    return null;
  }

  if (coordinates.length === 1) {
    const firstCoord = coordinates[0];
    return firstCoord ?? null;
  }

  let totalLat = 0;
  let totalLng = 0;

  for (const coord of coordinates) {
    if (coord.latitude !== undefined && coord.longitude !== undefined) {
      totalLat += coord.latitude;
      totalLng += coord.longitude;
    }
  }

  return {
    latitude: totalLat / coordinates.length,
    longitude: totalLng / coordinates.length,
  };
}
