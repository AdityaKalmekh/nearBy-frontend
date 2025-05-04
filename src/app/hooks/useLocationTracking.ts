"use client";

import { useState, useCallback, useEffect, useRef } from 'react';
// import { useInterval } from './useInterval';
import { LocationData, useLocation } from './useLocation';
// import { LOCATION_UPDATE_INTERVAL } from '../constants';
import { cookieAuth } from '@/lib/cookieAuth';
import useHttp from './use-http';
import { Socket } from 'socket.io-client';
import { initializeSocket } from '@/lib/socket';

interface TrackingApiResponse {
    success: boolean;
    message?: string;
}

export const useLocationTracking = (providerId: string | undefined) => {
    const socketRef = useRef<Socket | null>(null);
    const [isTracking, setIsTracking] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const { sendRequest } = useHttp();

    // Store the watchPosition ID for cleanup
    const watchPositionIdRef = useRef<number | null>(null);

    const {
        getLocation
    } = useLocation();

    // Store last reported position to calculate distance
    const lastPositionRef = useRef<{
        latitude: number;
        longitude: number;
        timestamp: number;
    } | null>(null);

    
    const startPositionWatching = useCallback(() => {
        
        // Calculate distance between two points in meters
        const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
            const R = 6371e3; // Earth radius in meters
            const φ1 = lat1 * Math.PI / 180;
            const φ2 = lat2 * Math.PI / 180;
            const Δφ = (lat2 - lat1) * Math.PI / 180;
            const Δλ = (lon2 - lon1) * Math.PI / 180;
    
            const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
                Math.cos(φ1) * Math.cos(φ2) *
                Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    
            return R * c;
        };
        // Check if movement is significant enough to report
        const isSignificantMovement = (newPosition: GeolocationPosition): boolean => {
            if (!lastPositionRef.current) return true;
            
            const { latitude: lastLat, longitude: lastLng } = lastPositionRef.current;
            const { latitude: newLat, longitude: newLng } = newPosition.coords;
    
            // Calculate distance moved
            const distanceMoved = calculateDistance(lastLat, lastLng, newLat, newLng);
    
            // Define minimum distance (in meters) to trigger an update
            const MIN_DISTANCE = 50; // 50 meters
    
            // Also update if enough time has passed regardless of distance
            const timeDiff = newPosition.timestamp - lastPositionRef.current.timestamp;
            const MAX_TIME_BETWEEN_UPDATES = 1 * 60 * 1000; // 5 minutes
            
            return distanceMoved > MIN_DISTANCE || timeDiff > MAX_TIME_BETWEEN_UPDATES;
        };

        // Clear any existing watch
        if (watchPositionIdRef.current !== null) {
            navigator.geolocation.clearWatch(watchPositionIdRef.current);
        }

        // Set up options for watchPosition
        const options = {
            enableHighAccuracy: true,
            maximumAge: 30000,       // Accept positions up to 30 seconds old
            timeout: 27000           // Wait up to 27 seconds for a position
        };

        // Start watching position
        watchPositionIdRef.current = navigator.geolocation.watchPosition(
            (position) => {                
                // Check if movement is significant enough to report
                if (isSignificantMovement(position)) {
                    const { latitude, longitude, accuracy } = position.coords;

                    // Send location update via socket
                    if (socketRef.current?.connected && providerId) {
                        socketRef.current.emit('provider:location', {
                            providerId,
                            location: {
                                coordinates: [longitude, latitude]
                            },
                            source: 'app',
                            accuracy: accuracy || 0
                        });

                        // Update last reported position
                        lastPositionRef.current = {
                            latitude,
                            longitude,
                            timestamp: position.timestamp
                        };

                        console.log(`[Location] Significant movement detected: ${latitude}, ${longitude}`);
                    }
                }
            },
            (positionError) => {
                console.error('Error watching position:', positionError);

                // If permission denied, fallback to interval-based updates
                if (positionError.code === positionError.PERMISSION_DENIED) {
                    console.warn('Location permission denied, falling back to interval updates');
                    // fallbackToIntervalUpdates();
                }
            },
            options
        );
    }, [providerId]);

    // Start tracking
    const startTracking = useCallback(async (locationData: LocationData) => {
        try {
            // Call API to initialize in the database
            return new Promise((resolve, reject) => {
                sendRequest({
                    url: `provider/location/start/${providerId}`,
                    method: 'POST',
                    data: {
                        longitude: locationData.coordinates[0],
                        latitude: locationData.coordinates[1],
                        accuracy: locationData.accuracy,
                        source: locationData.source
                    }
                },
                    (response) => {
                        const Response = response as TrackingApiResponse;
                        if (Response.success){
                            // On success, set active state
                            setIsTracking(true);
                            setError(null);
    
                            // Initialize last position with starting position
                            lastPositionRef.current = {
                                latitude: locationData.coordinates[1],
                                longitude: locationData.coordinates[0],
                                timestamp: Date.now()
                            };
    
                            // Start watching position
                            startPositionWatching();
    
                            resolve(true);
                        }else {
                            resolve(false)
                        }
                    },
                    (error) => {
                        setError(error.message);
                        reject(error);
                    });
            });
        } catch (error) {
            console.error('Error starting location tracking:', error);
            throw error;
        }
    }, [providerId, sendRequest, startPositionWatching]);

    // Function to start watching position

    // Fallback to interval-based updates if watchPosition fails
    // const fallbackToIntervalUpdates = useCallback(() => {
    //     const intervalId = setInterval(() => {
    //         navigator.geolocation.getCurrentPosition(
    //             (position) => {
    //                 const { latitude, longitude, accuracy } = position.coords;

    //                 // We'll always update on interval-based fallback
    //                 if (socketRef.current?.connected && providerId) {
    //                     socketRef.current.emit('provider:location', {
    //                         providerId,
    //                         location: {
    //                             coordinates: [longitude, latitude]
    //                         },
    //                         source: 'app',
    //                         accuracy: accuracy || 0
    //                     });
    //                 }
    //             },
    //             (error) => {
    //                 console.error('Error getting current position:', error);
    //             },
    //             { enableHighAccuracy: true, timeout: 10000 }
    //         );
    //     }, 60000); // Once per minute as fallback

    //     // Store interval ID using a closure
    //     return () => clearInterval(intervalId);
    // }, [providerId]);

    // Stop tracking
    const stopTracking = useCallback(async () => {
      try {
        // Call the API to properly end the shift
        return new Promise((resolve, reject) => {
          sendRequest({
            url: `provider/location/stop/${providerId}`,
            method: 'POST'
          }, 
          (response) => {
            // On success, set inactive state
            setIsTracking(false);

            // Stop watching position
            if (watchPositionIdRef.current !== null) {
              navigator.geolocation.clearWatch(watchPositionIdRef.current);
              watchPositionIdRef.current = null;
            }

            // Reset last position
            lastPositionRef.current = null;

            resolve(response);
          },
          (error) => {
            setError(error.message);
            reject(error);
          });
        });
      } catch (error) {
        console.error('Error stopping location tracking:', error);
        throw error;
      }
    }, [providerId, sendRequest]);

    // Initialize socket connection
    useEffect(() => {
        if (!providerId) return;

        const socket = initializeSocket(providerId);
        socketRef.current = socket;

        return () => {
            // Clean up on unmount
            if (watchPositionIdRef.current !== null) {
                navigator.geolocation.clearWatch(watchPositionIdRef.current);
                watchPositionIdRef.current = null;
            }
        };
    }, [providerId]);

    const handleStatusChange = async (checked: boolean) => {
        setError(null);

        if (checked) {
            try {
                const currentLocation = await getLocation();
                const success = await startTracking(currentLocation);
                console.log({ success });
                
                if (success) {
                    setIsTracking(true);
                    cookieAuth.providerStatusHandler();
                }
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to start tracking');
                setIsTracking(false);
                cookieAuth.providerStatusHandler();
            }
        } else {
            stopTracking();
            cookieAuth.providerStatusHandler();
        }
    }

    return {
        isTracking,
        error,
        handleStatusChange
    };
}