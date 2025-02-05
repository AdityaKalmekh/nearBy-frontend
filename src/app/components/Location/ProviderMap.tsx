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
  const [positionMarker, setPositionMarker] = useState<google.maps.Marker | null>(null);
  const watchIdRef = useRef<number | null>(null);

  const { isLoaded } = useLoadScript({
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
    libraries: ['places'],
  });

  const mapOptions = useMemo<google.maps.MapOptions>(() => ({
    disableDefaultUI: false,
    clickableIcons: true,
    scrollwheel: true,
    zoomControl: true,
    center: {
      lat: requesterLocation.coordinates[1],
      lng: requesterLocation.coordinates[0]
    },
    zoom: 15,
    heading: 0,
    tilt: 45,
    mapId: 'navigation_map'
  }), [requesterLocation]);

  const createNavigationArrow = useCallback(() => {
    return {
      path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
      scale: 8,
      fillColor: '#4285F4', // Google Maps blue
      fillOpacity: 1,
      strokeColor: '#FFFFFF',
      strokeWeight: 2,
      rotation: 0 // Will be updated with actual heading
    };
  }, []);

  useEffect(() => {
    if (!isLoaded || !mapRef.current) return;

    const newMap = new google.maps.Map(mapRef.current, mapOptions);
    const renderer = new google.maps.DirectionsRenderer({
      map: newMap,
      suppressMarkers: true,
      polylineOptions: {
        strokeColor: '#4285F4',
        strokeWeight: 5,
        strokeOpacity: 0.8
      }
    });

    // Initialize position marker with navigation arrow
    const marker = new google.maps.Marker({
      map: newMap,
      icon: createNavigationArrow(),
      zIndex: 2, // Keep arrow above other elements
      optimized: true // Better performance for frequent updates
    });

    setMap(newMap);
    setDirectionsRenderer(renderer);
    setPositionMarker(marker);

    return () => {
      if (watchIdRef.current) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, [isLoaded, mapOptions, createNavigationArrow]);

  useEffect(() => {
    if (!map || !directionsRenderer || !positionMarker || !isLoaded) return;

    if (!socket) return;

    if ("geolocation" in navigator) {
      watchIdRef.current = navigator.geolocation.watchPosition(
        (position: GeolocationPosition) => {
          const { latitude, longitude, heading, speed } = position.coords;
          const providerLocation = {
            lat: latitude,
            lng: longitude
          };

          // Update marker position and rotation
          positionMarker.setPosition(providerLocation);
          if (heading !== null) {
            const icon = positionMarker.getIcon() as google.maps.Symbol;
            icon.rotation = heading;
            positionMarker.setIcon(icon);
          }

          // Rotate map to match heading if in navigation mode
          if (heading !== null && speed && speed > 1) { // Only rotate when moving
            map.setHeading(heading);
          }

          // Update camera position smoothly
          map.panTo(providerLocation);

          // Send location update through socket
          socket.emit('location:update', {
            serviceRequestId,
            location: {
              coordinates: [position.coords.longitude, position.coords.latitude]
            }
          });

          // Update directions
          const directionsService = new google.maps.DirectionsService();
          directionsService.route(
            {
              origin: providerLocation,
              destination: {
                lat: requesterLocation.coordinates[1],
                lng: requesterLocation.coordinates[0]
              },
              travelMode: google.maps.TravelMode.DRIVING
            },
            (result, status) => {
              if (status === 'OK' && result) {
                directionsRenderer.setDirections(result);
              }
            }
          );
        },
        (error: GeolocationPositionError) => console.error("Error getting location:", error),
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0
        }
      );
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