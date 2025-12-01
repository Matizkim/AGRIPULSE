import React, { useEffect, useState } from "react";
import { MapPinIcon, ClockIcon, TruckIcon } from "@heroicons/react/24/outline";

/**
 * Transport Tracking Component
 * Displays real-time location tracking for transport using Google Maps
 * 
 * NOTE: TEMPORARILY DISABLED - Re-enable when Google Maps API key is obtained
 * To re-enable:
 * 1. Uncomment the Google Maps script loading code
 * 2. Add REACT_APP_GOOGLE_MAPS_API_KEY to .env
 * 3. Remove the temporary disabled message
 */
export default function TransportTracking({ match, driverLocation }) {
  // TEMPORARILY DISABLED - Return simple location display
  const currentLocation = driverLocation || match?.transportDetails?.currentLocation;
  
  return (
    <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-blue-100 rounded-lg">
          <TruckIcon className="w-6 h-6 text-blue-600" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-slate-800">Transport Tracking</h3>
          <p className="text-sm text-slate-600">Location information</p>
        </div>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
        <p className="text-sm text-yellow-800">
          <strong>Note:</strong> Google Maps tracking is temporarily disabled. 
          It will be re-enabled once the API key is configured.
        </p>
      </div>

      {/* Location Info */}
      {currentLocation && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <p className="text-xs font-semibold text-blue-700 uppercase tracking-wide mb-1">Current Location</p>
            <p className="text-sm text-slate-800 font-medium">
              {currentLocation.address || `Lat: ${currentLocation.lat?.toFixed(4)}, Lng: ${currentLocation.lng?.toFixed(4)}` || "Not available"}
            </p>
            {currentLocation.timestamp && (
              <p className="text-xs text-slate-600 mt-1 flex items-center gap-1">
                <ClockIcon className="w-3 h-3" />
                Updated: {new Date(currentLocation.timestamp).toLocaleString()}
              </p>
            )}
          </div>

          {match?.transportDetails?.pickupLocation && (
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <p className="text-xs font-semibold text-green-700 uppercase tracking-wide mb-1">Pickup Point</p>
              <p className="text-sm text-slate-800 font-medium">
                {match.transportDetails.pickupLocation.town || match.transportDetails.pickupLocation.county || "N/A"}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Status Indicator */}
      <div className="mt-4 pt-4 border-t border-slate-200">
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${match?.status === 'in_transit' ? 'bg-green-500 animate-pulse' : 'bg-slate-400'}`}></div>
          <span className="text-sm text-slate-700">
            Status: <strong className="capitalize">{match?.status?.replace('_', ' ') || 'Unknown'}</strong>
          </span>
        </div>
      </div>
    </div>
  );

  /* 
  // TEMPORARILY DISABLED - Uncomment when Google Maps API key is ready
  const [mapLoaded, setMapLoaded] = useState(false);
  const [currentLocation, setCurrentLocation] = useState(driverLocation || match?.transportDetails?.currentLocation);

  useEffect(() => {
    // Load Google Maps script
    if (!window.google && process.env.REACT_APP_GOOGLE_MAPS_API_KEY) {
      const script = document.createElement("script");
      script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.REACT_APP_GOOGLE_MAPS_API_KEY}&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = () => setMapLoaded(true);
      document.head.appendChild(script);
    } else if (window.google) {
      setMapLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (mapLoaded && currentLocation && window.google) {
      initMap();
    }
  }, [mapLoaded, currentLocation]);

  const initMap = () => {
    const mapElement = document.getElementById("transport-map");
    if (!mapElement) return;

    const map = new window.google.maps.Map(mapElement, {
      center: { lat: currentLocation.lat, lng: currentLocation.lng },
      zoom: 12,
      mapTypeControl: true,
      streetViewControl: false,
      fullscreenControl: true
    });

    // Add marker for current location
    new window.google.maps.Marker({
      position: { lat: currentLocation.lat, lng: currentLocation.lng },
      map: map,
      title: "Driver Current Location",
      icon: {
        url: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png"
      }
    });

    // Add pickup location marker
    if (match?.transportDetails?.pickupLocation) {
      new window.google.maps.Marker({
        position: {
          lat: match.transportDetails.pickupLocation.lat,
          lng: match.transportDetails.pickupLocation.lng
        },
        map: map,
        title: "Pickup Location",
        icon: {
          url: "http://maps.google.com/mapfiles/ms/icons/green-dot.png"
        }
      });
    }

    // Add dropoff location marker
    if (match?.transportDetails?.dropoffLocation) {
      new window.google.maps.Marker({
        position: {
          lat: match.transportDetails.dropoffLocation.lat,
          lng: match.transportDetails.dropoffLocation.lng
        },
        map: map,
        title: "Dropoff Location",
        icon: {
          url: "http://maps.google.com/mapfiles/ms/icons/red-dot.png"
        }
      });
    }

    // Draw route if both locations exist
    if (match?.transportDetails?.pickupLocation && match?.transportDetails?.dropoffLocation) {
      const directionsService = new window.google.maps.DirectionsService();
      const directionsRenderer = new window.google.maps.DirectionsRenderer();
      directionsRenderer.setMap(map);

      directionsService.route(
        {
          origin: {
            lat: match.transportDetails.pickupLocation.lat,
            lng: match.transportDetails.pickupLocation.lng
          },
          destination: {
            lat: match.transportDetails.dropoffLocation.lat,
            lng: match.transportDetails.dropoffLocation.lng
          },
          travelMode: window.google.maps.TravelMode.DRIVING
        },
        (result, status) => {
          if (status === window.google.maps.DirectionsStatus.OK) {
            directionsRenderer.setDirections(result);
          }
        }
      );
    }
  };

  const trackingHistory = match?.transportDetails?.trackingHistory || [];

  return (
    <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-blue-100 rounded-lg">
          <TruckIcon className="w-6 h-6 text-blue-600" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-slate-800">Transport Tracking</h3>
          <p className="text-sm text-slate-600">Real-time location updates</p>
        </div>
      </div>

      {/* Map Container */}
      <div className="mb-6">
        {mapLoaded && process.env.REACT_APP_GOOGLE_MAPS_API_KEY ? (
          <div id="transport-map" className="w-full h-96 rounded-lg border border-slate-200" />
        ) : (
          <div className="w-full h-96 rounded-lg border border-slate-200 bg-slate-100 flex items-center justify-center">
            <div className="text-center">
              <MapPinIcon className="w-16 h-16 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-600 mb-2">Google Maps not configured</p>
              <p className="text-xs text-slate-500">
                Add REACT_APP_GOOGLE_MAPS_API_KEY to .env to enable tracking
              </p>
              {/* Fallback: Show location info */}
              {currentLocation && (
                <div className="mt-4 p-4 bg-white rounded-lg border border-slate-200">
                  <p className="text-sm font-semibold text-slate-800 mb-2">Current Location:</p>
                  <p className="text-sm text-slate-600">
                    {currentLocation.address || `Lat: ${currentLocation.lat.toFixed(4)}, Lng: ${currentLocation.lng.toFixed(4)}`}
                  </p>
                  {currentLocation.timestamp && (
                    <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                      <ClockIcon className="w-3 h-3" />
                      {new Date(currentLocation.timestamp).toLocaleString()}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Location Info */}
      {currentLocation && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <p className="text-xs font-semibold text-blue-700 uppercase tracking-wide mb-1">Current Location</p>
            <p className="text-sm text-slate-800 font-medium">
              {currentLocation.address || "Location not available"}
            </p>
            {currentLocation.timestamp && (
              <p className="text-xs text-slate-600 mt-1 flex items-center gap-1">
                <ClockIcon className="w-3 h-3" />
                Updated: {new Date(currentLocation.timestamp).toLocaleString()}
              </p>
            )}
          </div>

          {match?.transportDetails?.pickupLocation && (
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <p className="text-xs font-semibold text-green-700 uppercase tracking-wide mb-1">Pickup Point</p>
              <p className="text-sm text-slate-800 font-medium">
                {match.transportDetails.pickupLocation.town || match.transportDetails.pickupLocation.county || "N/A"}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Tracking History */}
      {trackingHistory.length > 0 && (
        <div className="mt-4">
          <h4 className="text-sm font-semibold text-slate-800 mb-2">Location History</h4>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {trackingHistory.slice(-10).reverse().map((point, index) => (
              <div key={index} className="flex items-center gap-2 p-2 bg-slate-50 rounded text-xs">
                <MapPinIcon className="w-4 h-4 text-slate-400" />
                <span className="text-slate-600">
                  {point.address || `Lat: ${point.lat.toFixed(4)}, Lng: ${point.lng.toFixed(4)}`}
                </span>
                {point.timestamp && (
                  <span className="text-slate-400 ml-auto">
                    {new Date(point.timestamp).toLocaleTimeString()}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Status Indicator */}
      <div className="mt-4 pt-4 border-t border-slate-200">
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${match?.status === 'in_transit' ? 'bg-green-500 animate-pulse' : 'bg-slate-400'}`}></div>
          <span className="text-sm text-slate-700">
            Status: <strong className="capitalize">{match?.status?.replace('_', ' ') || 'Unknown'}</strong>
          </span>
        </div>
      </div>
    </div>
  );
  */
}
  const [mapLoaded, setMapLoaded] = useState(false);
  const [currentLocation, setCurrentLocation] = useState(driverLocation || match?.transportDetails?.currentLocation);

  useEffect(() => {
    // Load Google Maps script
    if (!window.google && process.env.REACT_APP_GOOGLE_MAPS_API_KEY) {
      const script = document.createElement("script");
      script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.REACT_APP_GOOGLE_MAPS_API_KEY}&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = () => setMapLoaded(true);
      document.head.appendChild(script);
    } else if (window.google) {
      setMapLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (mapLoaded && currentLocation && window.google) {
      initMap();
    }
  }, [mapLoaded, currentLocation]);

  const initMap = () => {
    const mapElement = document.getElementById("transport-map");
    if (!mapElement) return;

    const map = new window.google.maps.Map(mapElement, {
      center: { lat: currentLocation.lat, lng: currentLocation.lng },
      zoom: 12,
      mapTypeControl: true,
      streetViewControl: false,
      fullscreenControl: true
    });

    // Add marker for current location
    new window.google.maps.Marker({
      position: { lat: currentLocation.lat, lng: currentLocation.lng },
      map: map,
      title: "Driver Current Location",
      icon: {
        url: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png"
      }
    });

    // Add pickup location marker
    if (match?.transportDetails?.pickupLocation) {
      new window.google.maps.Marker({
        position: {
          lat: match.transportDetails.pickupLocation.lat,
          lng: match.transportDetails.pickupLocation.lng
        },
        map: map,
        title: "Pickup Location",
        icon: {
          url: "http://maps.google.com/mapfiles/ms/icons/green-dot.png"
        }
      });
    }

    // Add dropoff location marker
    if (match?.transportDetails?.dropoffLocation) {
      new window.google.maps.Marker({
        position: {
          lat: match.transportDetails.dropoffLocation.lat,
          lng: match.transportDetails.dropoffLocation.lng
        },
        map: map,
        title: "Dropoff Location",
        icon: {
          url: "http://maps.google.com/mapfiles/ms/icons/red-dot.png"
        }
      });
    }

    // Draw route if both locations exist
    if (match?.transportDetails?.pickupLocation && match?.transportDetails?.dropoffLocation) {
      const directionsService = new window.google.maps.DirectionsService();
      const directionsRenderer = new window.google.maps.DirectionsRenderer();
      directionsRenderer.setMap(map);

      directionsService.route(
        {
          origin: {
            lat: match.transportDetails.pickupLocation.lat,
            lng: match.transportDetails.pickupLocation.lng
          },
          destination: {
            lat: match.transportDetails.dropoffLocation.lat,
            lng: match.transportDetails.dropoffLocation.lng
          },
          travelMode: window.google.maps.TravelMode.DRIVING
        },
        (result, status) => {
          if (status === window.google.maps.DirectionsStatus.OK) {
            directionsRenderer.setDirections(result);
          }
        }
      );
    }
  };

  const trackingHistory = match?.transportDetails?.trackingHistory || [];

  return (
    <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-blue-100 rounded-lg">
          <TruckIcon className="w-6 h-6 text-blue-600" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-slate-800">Transport Tracking</h3>
          <p className="text-sm text-slate-600">Real-time location updates</p>
        </div>
      </div>

      {/* Map Container */}
      <div className="mb-6">
        {mapLoaded && process.env.REACT_APP_GOOGLE_MAPS_API_KEY ? (
          <div id="transport-map" className="w-full h-96 rounded-lg border border-slate-200" />
        ) : (
          <div className="w-full h-96 rounded-lg border border-slate-200 bg-slate-100 flex items-center justify-center">
            <div className="text-center">
              <MapPinIcon className="w-16 h-16 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-600 mb-2">Google Maps not configured</p>
              <p className="text-xs text-slate-500">
                Add REACT_APP_GOOGLE_MAPS_API_KEY to .env to enable tracking
              </p>
              {/* Fallback: Show location info */}
              {currentLocation && (
                <div className="mt-4 p-4 bg-white rounded-lg border border-slate-200">
                  <p className="text-sm font-semibold text-slate-800 mb-2">Current Location:</p>
                  <p className="text-sm text-slate-600">
                    {currentLocation.address || `Lat: ${currentLocation.lat.toFixed(4)}, Lng: ${currentLocation.lng.toFixed(4)}`}
                  </p>
                  {currentLocation.timestamp && (
                    <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                      <ClockIcon className="w-3 h-3" />
                      {new Date(currentLocation.timestamp).toLocaleString()}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Location Info */}
      {currentLocation && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <p className="text-xs font-semibold text-blue-700 uppercase tracking-wide mb-1">Current Location</p>
            <p className="text-sm text-slate-800 font-medium">
              {currentLocation.address || "Location not available"}
            </p>
            {currentLocation.timestamp && (
              <p className="text-xs text-slate-600 mt-1 flex items-center gap-1">
                <ClockIcon className="w-3 h-3" />
                Updated: {new Date(currentLocation.timestamp).toLocaleString()}
              </p>
            )}
          </div>

          {match?.transportDetails?.pickupLocation && (
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <p className="text-xs font-semibold text-green-700 uppercase tracking-wide mb-1">Pickup Point</p>
              <p className="text-sm text-slate-800 font-medium">
                {match.transportDetails.pickupLocation.town || match.transportDetails.pickupLocation.county || "N/A"}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Tracking History */}
      {trackingHistory.length > 0 && (
        <div className="mt-4">
          <h4 className="text-sm font-semibold text-slate-800 mb-2">Location History</h4>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {trackingHistory.slice(-10).reverse().map((point, index) => (
              <div key={index} className="flex items-center gap-2 p-2 bg-slate-50 rounded text-xs">
                <MapPinIcon className="w-4 h-4 text-slate-400" />
                <span className="text-slate-600">
                  {point.address || `Lat: ${point.lat.toFixed(4)}, Lng: ${point.lng.toFixed(4)}`}
                </span>
                {point.timestamp && (
                  <span className="text-slate-400 ml-auto">
                    {new Date(point.timestamp).toLocaleTimeString()}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Status Indicator */}
      <div className="mt-4 pt-4 border-t border-slate-200">
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${match?.status === 'in_transit' ? 'bg-green-500 animate-pulse' : 'bg-slate-400'}`}></div>
          <span className="text-sm text-slate-700">
            Status: <strong className="capitalize">{match?.status?.replace('_', ' ') || 'Unknown'}</strong>
          </span>
        </div>
      </div>
    </div>
  );
}

