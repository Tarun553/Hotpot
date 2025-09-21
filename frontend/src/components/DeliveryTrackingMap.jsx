import React, { useEffect, useRef } from "react";
import { GoogleMap, useJsApiLoader } from "@react-google-maps/api";

// Custom marker content (shadcn + tailwind styled)
const MarkerContent = ({ imgSrc, bg = "bg-white", size = 44, label }) => {
  const wrapper = document.createElement("div");
  wrapper.className = `rounded-full shadow-md border ${bg} flex items-center justify-center`;
  wrapper.style.width = `${size}px`;
  wrapper.style.height = `${size}px`;

  const inner = document.createElement("div");
  inner.className = "flex flex-col items-center";

  const img = document.createElement("img");
  img.src = imgSrc;
  img.alt = "";
  img.style.width = `${Math.floor(size * 0.8)}px`;
  img.style.height = `${Math.floor(size * 0.8)}px`;
  img.style.objectFit = "contain";

  inner.appendChild(img);

  if (label) {
    const span = document.createElement("span");
    span.textContent = label;
    span.className = "text-xs font-medium text-gray-700 mt-1";
    inner.appendChild(span);
  }

  wrapper.appendChild(inner);
  return wrapper;
};

const DeliveryTrackingMap = ({ delivery }) => {
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries: ["marker"], // Needed for AdvancedMarker
  });

  const mapRef = useRef(null);
  const markersRef = useRef([]);
  const polylineRef = useRef(null);

  const clearMarkersAndPolyline = () => {
    markersRef.current.forEach((m) => {
      if (m?.setMap) m.setMap(null);
    });
    markersRef.current = [];
    if (polylineRef.current) {
      polylineRef.current.setMap(null);
      polylineRef.current = null;
    }
  };

  const coordsToLatLng = (coords) =>
    coords?.length >= 2 ? { lat: Number(coords[1]), lng: Number(coords[0]) } : null;

  if (!delivery?.order?.deliveryAddress?.latitude) return null;

  const address = delivery.order.deliveryAddress;
  const addressPos = { lat: Number(address.latitude), lng: Number(address.longitude) };

  const assignedCoords = delivery?.assignedTo?.location?.coordinates;
  const deliveryBoyLocation = coordsToLatLng(assignedCoords);

  const handleMapLoad = (map) => {
    mapRef.current = map;
    try {
      const bounds = new window.google.maps.LatLngBounds();
      bounds.extend(addressPos);
      if (deliveryBoyLocation) bounds.extend(deliveryBoyLocation);
      map.fitBounds(bounds, 80);
    } catch {
      mapRef.current.setCenter(addressPos);
      mapRef.current.setZoom(14);
    }
    createMarkersAndPolyline();
  };

  const createMarkersAndPolyline = () => {
    if (!mapRef.current || !window.google?.maps) return;
    clearMarkersAndPolyline();
    const map = mapRef.current;

    const hasAdvancedMarker =
      window.google.maps.marker && window.google.maps.marker.AdvancedMarkerElement;

    try {
      // Customer marker
      if (hasAdvancedMarker) {
        const homeMarker = new window.google.maps.marker.AdvancedMarkerElement({
          position: addressPos,
          map,
          content: MarkerContent({ imgSrc: "/home.png", bg: "bg-white", size: 48 }),
          title: "Delivery address",
        });
        markersRef.current.push(homeMarker);
      } else {
        const homeMarker = new window.google.maps.Marker({
          position: addressPos,
          map,
          icon: {
            url: "/home.png",
            scaledSize: new window.google.maps.Size(40, 40),
          },
        });
        markersRef.current.push(homeMarker);
      }

      // Delivery boy marker
      if (deliveryBoyLocation) {
        if (hasAdvancedMarker) {
          const boyMarker = new window.google.maps.marker.AdvancedMarkerElement({
            position: deliveryBoyLocation,
            map,
            content: MarkerContent({
              imgSrc: "/scooter.png",
              bg: "bg-orange-100",
              size: 50,
              label: delivery.assignedTo?.fullName || "Delivery boy",
            }),
            title: delivery.assignedTo?.fullName || "Delivery boy",
          });
          markersRef.current.push(boyMarker);
        } else {
          const boyMarker = new window.google.maps.Marker({
            position: deliveryBoyLocation,
            map,
            icon: {
              url: "/scooter.png",
              scaledSize: new window.google.maps.Size(44, 44),
            },
          });
          markersRef.current.push(boyMarker);
        }

        // Polyline between delivery boy and address
        polylineRef.current = new window.google.maps.Polyline({
          path: [deliveryBoyLocation, addressPos],
          strokeColor: "#FF6B35",
          strokeOpacity: 1,
          strokeWeight: 4,
        });
        polylineRef.current.setMap(map);
      }
    } catch (err) {
      console.error("Marker creation error:", err);
    }
  };

  useEffect(() => {
    if (!isLoaded || !mapRef.current) return;
    createMarkersAndPolyline();
    try {
      const bounds = new window.google.maps.LatLngBounds();
      bounds.extend(addressPos);
      if (deliveryBoyLocation) bounds.extend(deliveryBoyLocation);
      mapRef.current.fitBounds(bounds, 80);
    } catch {}
  }, [isLoaded, delivery?.assignedTo?.location?.coordinates, delivery?.order?.deliveryAddress?.latitude]);

  useEffect(() => {
    return () => {
      clearMarkersAndPolyline();
      mapRef.current = null;
    };
  }, []);

  if (loadError) {
    return <div className="h-72 bg-gray-100 flex items-center justify-center">Map failed to load</div>;
  }

  return isLoaded ? (
    <GoogleMap
      mapContainerStyle={{ height: "300px", width: "100%" }}
      center={addressPos}
      zoom={14}
      onLoad={handleMapLoad}
      onUnmount={() => {
        clearMarkersAndPolyline();
        mapRef.current = null;
      }}
      options={{
        mapId: import.meta.env.VITE_GOOGLE_MAPS_MAP_ID, // ✅ required for advanced markers
        disableDefaultUI: true,
        zoomControl: true,
        styles: [
          { elementType: "geometry", stylers: [{ color: "#f5f5f5" }] },
          { elementType: "labels.text.fill", stylers: [{ color: "#333333" }] },
          { elementType: "labels.text.stroke", stylers: [{ color: "#ffffff" }] },
          { featureType: "road", elementType: "geometry", stylers: [{ color: "#cccccc" }] },
          { featureType: "water", elementType: "geometry", stylers: [{ color: "#cce7ff" }] },
          { featureType: "poi", elementType: "geometry", stylers: [{ color: "#eeeeee" }] },
        ],
      }}
    />
  ) : (
    <div className="h-72 bg-gray-100 flex items-center justify-center">Loading map...</div>
  );
};

export default DeliveryTrackingMap;
