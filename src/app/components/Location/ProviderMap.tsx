import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Phone, CheckCircle, Check } from "lucide-react";
import { Socket } from 'socket.io-client';
import { useLoadScript } from '@react-google-maps/api';
export interface Location {
  coordinates: [number, number]; // [longitude, latitude]
}
interface ProviderMapProps {
  requesterLocation: Location;
  onStartService: () => void;
  onCompleteService: () => void;
  // onCallUser: () => void;
  socket: Socket | null;
  serviceRequestId: string;
}

const GOOGLE_MAPS_API_KEY = `${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API}`;

const ProviderMap: React.FC<ProviderMapProps> = ({
  requesterLocation,
  onStartService,
  onCompleteService,
  // onCallUser,
  socket,
  serviceRequestId
}) => {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [directionsRenderer, setDirectionsRenderer] = useState<google.maps.DirectionsRenderer | null>(null);
  const [positionMarker, setPositionMarker] = useState<google.maps.marker.AdvancedMarkerElement | null>(null);
  const watchIdRef = useRef<number | null>(null);
  const lastUpdatedRef = useRef<number>(0);
  const currentPositionRef = useRef<google.maps.LatLngLiteral | null>(null);

  const { isLoaded } = useLoadScript({
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
    libraries: ['places', 'marker'],
  });

  const UPDATE_INTERVAL = 1000;
  const ROUTE_UPDATE_INTERVAL = 5000;

  // Create custom navigation arrow element
  const createProviderMarker = useCallback(() => {
    const arrow = document.createElement('div');
    arrow.innerHTML = `
      <div class="navigation-arrow" style="
        width: 24px;
        height: 24px;
        background-color: #4285F4;
        border: 2px solid white;
        border-radius: 50%;
        transform: rotate(0deg);
        transition: transform 0.3s ease;
      ">
        <div style="
          width: 0;
          height: 0;
          border-left: 8px solid transparent;
          border-right: 8px solid transparent;
          border-bottom: 16px solid white;
          position: relative;
          left: 2px;
          top: 2px;
        "></div>
      </div>
    `;
    return arrow;
  }, []);

  const smoothPanTo = (map: google.maps.Map, position: google.maps.LatLngLiteral) => {
    map.panTo(position);
  };

  const calculateDistance = (p1: google.maps.LatLngLiteral, p2: google.maps.LatLngLiteral) => {
    const lat1 = p1.lat * Math.PI / 180;
    const lat2 = p2.lat * Math.PI / 180;
    const lng1 = p1.lng * Math.PI / 180;
    const lng2 = p2.lng * Math.PI / 180;

    const R = 6371e3; // Earth's radius in meters
    const φ1 = lat1;
    const φ2 = lat2;
    const Δφ = (lat2 - lat1);
    const Δλ = (lng2 - lng1);

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) *
      Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  };

  const createRequesterMarker = useCallback(() => {
    const pin = document.createElement('div');
    pin.innerHTML = `
      <div style="
        width: 24px;
        height: 24px;
        background-color: #DC2626;
        border: 2px solid white;
        border-radius: 50%;
        box-shadow: 0 2px 4px rgba(0,0,0,0.25);
      "></div>
    `;
    return pin;
  }, []);

  const mapOptions = useMemo<google.maps.MapOptions>(() => ({
    disableDefaultUI: true,
    clickableIcons: false,
    scrollwheel: true,
    zoomControl: true,
    center: {
      lat: requesterLocation.coordinates[1],
      lng: requesterLocation.coordinates[0]
    },
    zoom: 16,
    tilt: 0,
    mapId: 'navigation_map',
    gestureHandling: 'cooperative',
    minZoom: 12,
    maxZoom: 20
  }), [requesterLocation]);

  useEffect(() => {
    if (!isLoaded || !mapRef.current) return;

    const newMap = new google.maps.Map(mapRef.current, mapOptions);
    const renderer = new google.maps.DirectionsRenderer({
      map: newMap,
      suppressMarkers: true,
      polylineOptions: {
        strokeColor: '#4285F4',
        strokeWeight: 5
      }
    });

    const provider = new google.maps.marker.AdvancedMarkerElement({
      map: newMap,
      content: createProviderMarker(),
      position: newMap.getCenter(),
      zIndex: 2
    });


    // Create requester marker directly without storing in state
    new google.maps.marker.AdvancedMarkerElement({
      map: newMap,
      content: createRequesterMarker(),
      position: {
        lat: requesterLocation.coordinates[1],
        lng: requesterLocation.coordinates[0]
      },
      zIndex: 1
    });

    setMap(newMap);
    setDirectionsRenderer(renderer);
    setPositionMarker(provider);

    return () => {
      if (watchIdRef.current) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, [createProviderMarker, createRequesterMarker, isLoaded, mapOptions, requesterLocation.coordinates]);

  useEffect(() => {
    if (!map || !directionsRenderer || !positionMarker || !isLoaded) return;

    if (!socket) return;

    const updateMapAndMarker = (position: GeolocationPosition) => {
      const now = Date.now();
      if (now - lastUpdatedRef.current < UPDATE_INTERVAL) return;

      const { latitude, longitude, heading } = position.coords;
      const newPosition = { lat: latitude, lng: longitude };

      // Only update if we've moved more than 10 meters
      if (currentPositionRef.current) {
        const distance = calculateDistance(currentPositionRef.current, newPosition);
        if (distance < 10) return; // Skip update if movement is too small
      }

      currentPositionRef.current = newPosition;

      // Update marker position smoothly
      positionMarker.position = newPosition;

      // Update arrow rotation
      if (heading !== null) {
        const content = positionMarker.content as HTMLElement;
        const arrow = content.querySelector('.navigation-arrow') as HTMLDivElement;
        if (arrow) {
          arrow.style.transform = `rotate(${heading}deg)`;
        }
      }

      // Smooth map movement
      smoothPanTo(map, newPosition);

      // Update route
      if (now - lastUpdatedRef.current > ROUTE_UPDATE_INTERVAL) {
        const directionsService = new google.maps.DirectionsService();
        directionsService.route({
          origin: newPosition,
          destination: {
            lat: requesterLocation.coordinates[1],
            lng: requesterLocation.coordinates[0]
          },
          travelMode: google.maps.TravelMode.DRIVING
        }, (result, status) => {
          if (status === 'OK' && result) {
            directionsRenderer.setDirections(result);
          }
        });
        lastUpdatedRef.current = now;
      }

      // Send location update
      socket.emit('location:update', {
        serviceRequestId,
        location: {
          coordinates: [longitude, latitude],
          heading: heading || 0
        }
      });

      lastUpdatedRef.current = now;
    };

    // if ("geolocation" in navigator) {
    watchIdRef.current = navigator.geolocation.watchPosition(
      updateMapAndMarker,
      (error: GeolocationPositionError) => console.error("Error getting location:", error),
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 2000
      }
    );
    // }

    return () => {
      if (watchIdRef.current) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    }
  }, [map, directionsRenderer, positionMarker, isLoaded, requesterLocation, socket, serviceRequestId]);

  if (!isLoaded) {
    return (
      <div className="h-[75vh] flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-blue-500 rounded-full border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="h-[75vh] mb-4">
        <div ref={mapRef} className="w-full h-full rounded-lg shadow-lg" />
      </div>
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <Button
              className="flex-1 bg-blue-500 hover:bg-blue-600 text-white"
            // onClick={onCallUser}
            >
              <Phone className="mr-2 h-4 w-4" />
              Call User
            </Button>
            <Button
              className="flex-1 bg-[#388E3C] hover:bg-[#2E7D32] text-white"
              onClick={onStartService}
            >
              <CheckCircle className="mr-2 h-4 w-4" />
              Start Service
            </Button>
            <Button
              className="flex-1 bg-purple-500 hover:bg-purple-600 text-white"
              onClick={onCompleteService}
            >
              <Check className="mr-2 h-4 w-4" />
              Complete Service
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProviderMap;