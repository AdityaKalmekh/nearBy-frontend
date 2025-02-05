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
  const [prevPosition, setPrevPosition] = useState<google.maps.LatLng | null>(null);
  const [prevHeading, setPrevHeading] = useState<number | null>(null);

  const { isLoaded } = useLoadScript({
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
    libraries: ['places', 'marker'],
  });

  const HEADING_THRESHOLD = 5; // degrees
  const POSITION_THRESHOLD = 5; // meters

  // Create custom navigation arrow element
  const createNavigationArrow = useCallback(() => {
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

  // Calculate distance between two points
  const calculateDistance = (p1: google.maps.LatLng, p2: google.maps.LatLng) => {
    return google.maps.geometry.spherical.computeDistanceBetween(p1, p2);
  };

  // Smooth out heading changes
  const smoothHeading = (newHeading: number, prevHeading: number) => {
    let diff = ((newHeading - prevHeading + 360) % 360);
    if (diff > 180) diff -= 360;
    return prevHeading + diff * 0.3; // Apply dampening factor
  };

  const mapOptions = useMemo<google.maps.MapOptions>(() => ({
    disableDefaultUI: true,
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

  // const createNavigationArrow = useCallback(() => {
  //   return {
  //     path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
  //     scale: 8,
  //     fillColor: '#4285F4', // Google Maps blue
  //     fillOpacity: 1,
  //     strokeColor: '#FFFFFF',
  //     strokeWeight: 2,
  //     rotation: 0 // Will be updated with actual heading
  //   };
  // }, []);

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
    const marker = new google.maps.marker.AdvancedMarkerElement({
      map: newMap,
      content: createNavigationArrow(),
      position: newMap.getCenter(), // Keep arrow above other elements
      zIndex: 2 // Better performance for frequent updates
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
          const currentPosition = new google.maps.LatLng(latitude, longitude);

          // Update marker position and rotation
          positionMarker.position = currentPosition;
          if (heading !== null) {
            const content = positionMarker.content as HTMLElement;
            const arrowElement = content.querySelector('.navigation-arrow') as HTMLDivElement;

            let newHeading = heading;
            if (prevHeading !== null) {
              const headingDiff = Math.abs(heading - prevHeading);
              if (headingDiff > HEADING_THRESHOLD) {
                newHeading = smoothHeading(heading, prevHeading);
                if (arrowElement) {
                  arrowElement.style.transform = `rotate(${newHeading}deg)`;
                }
                if (speed && speed > 2) {
                  map.setHeading(newHeading);
                }
              }
            }
            setPrevHeading(newHeading);
          }

          // Handle map position updates
          if (prevPosition) {
            const distance = calculateDistance(currentPosition, prevPosition);
            if (distance > POSITION_THRESHOLD) {
              map.panTo({
                lat: currentPosition.lat() * 0.7 + prevPosition.lat() * 0.3,
                lng: currentPosition.lng() * 0.7 + prevPosition.lng() * 0.3
              });
              setPrevPosition(currentPosition);
            }
          } else {
            setPrevPosition(currentPosition);
            map.panTo(currentPosition);
          }

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
              origin: { lat: latitude, lng: longitude },
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

    return () => {
      if (watchIdRef.current) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    }
  }, [map,
    directionsRenderer,
    positionMarker,
    isLoaded,
    requesterLocation,
    socket,
    serviceRequestId,
    prevPosition,
    prevHeading]);

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