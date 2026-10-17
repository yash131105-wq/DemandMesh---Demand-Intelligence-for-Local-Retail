import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { ParticipatingStore } from '../../types/index.ts';

interface LeafletStoreMapProps {
  stores: ParticipatingStore[];
  selectedStoreId: string | null;
  onSelectStore: (store: ParticipatingStore) => void;
  targetSKU: string;
}

export const LeafletStoreMap: React.FC<LeafletStoreMapProps> = ({
  stores,
  selectedStoreId,
  onSelectStore,
  targetSKU,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<{ [id: string]: L.Marker }>({});

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Prevent re-initialization if already created
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
    }

    // Central coordinates: Indiranagar, Bengaluru
    const centerLat = 12.9660;
    const centerLng = 77.6430;

    const map = L.map(mapContainerRef.current, {
      center: [centerLat, centerLng],
      zoom: 14,
      zoomControl: true,
      scrollWheelZoom: false, // Prevent page scroll interception
    });

    mapInstanceRef.current = map;

    // OpenStreetMap standard tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap contributors',
    }).addTo(map);

    // 2.5km cluster radius circle around Anand Supermarket
    const currentStore = stores.find(s => s.isCurrentUserStore) || stores[0];
    if (currentStore) {
      L.circle([currentStore.lat, currentStore.lng], {
        color: '#0BA69C',
        fillColor: '#31D5CD',
        fillOpacity: 0.08,
        radius: 2600,
        weight: 1.5,
        dashArray: '4, 6',
      }).addTo(map);
    }

    // Draw connecting demand paths from current store to neighbors
    stores.forEach(store => {
      if (!store.isCurrentUserStore && currentStore) {
        L.polyline(
          [
            [currentStore.lat, currentStore.lng],
            [store.lat, store.lng],
          ],
          {
            color: '#0BA69C',
            weight: 2,
            opacity: 0.6,
            dashArray: '5, 8',
          }
        ).addTo(map);
      }
    });

    // Custom pins for each store
    const markers: { [id: string]: L.Marker } = {};

    stores.forEach(store => {
      const isCurrent = store.isCurrentUserStore;

      // Custom HTML pin icon
      const customIcon = L.divIcon({
        className: 'custom-leaflet-pin',
        html: `
          <div style="
            position: relative;
            transform: translate(-50%, -100%);
            display: flex;
            flex-direction: column;
            align-items: center;
            cursor: pointer;
          ">
            <div style="
              background: ${isCurrent ? '#0B1730' : '#0BA69C'};
              color: white;
              border: 2px solid ${isCurrent ? '#31D5CD' : '#FFFFFF'};
              box-shadow: 0 4px 12px rgba(11, 23, 48, 0.35);
              border-radius: 9999px;
              padding: 4px 8px;
              font-size: 11px;
              font-weight: 700;
              font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
              white-space: nowrap;
              display: flex;
              align-items: center;
              gap: 4px;
            ">
              <span style="
                width: 6px;
                height: 6px;
                border-radius: 9999px;
                background: ${isCurrent ? '#31D5CD' : '#DCA84E'};
              "></span>
              <span>${store.name.split(' ')[0]}</span>
              <span style="
                background: rgba(255, 255, 255, 0.2);
                border-radius: 4px;
                padding: 1px 4px;
                font-size: 9px;
                font-family: monospace;
              ">${store.proteinOatsCommitment}u</span>
            </div>
            <div style="
              width: 0;
              height: 0;
              border-left: 6px solid transparent;
              border-right: 6px solid transparent;
              border-top: 7px solid ${isCurrent ? '#0B1730' : '#0BA69C'};
            "></div>
          </div>
        `,
        iconSize: [30, 42],
        iconAnchor: [15, 42],
      });

      const marker = L.marker([store.lat, store.lng], { icon: customIcon }).addTo(map);

      // Popup with store details
      const popupContent = `
        <div style="font-family: 'Plus Jakarta Sans', system-ui, sans-serif; min-width: 190px; color: #0B1730; padding: 2px;">
          <div style="font-size: 12px; font-weight: 700; color: #0B1730; margin-bottom: 2px;">
            ${store.name} ${isCurrent ? '<span style="color: #0BA69C; font-size: 10px;">(Your Shop)</span>' : ''}
          </div>
          <div style="font-size: 10px; color: #607087; margin-bottom: 6px;">
            ${store.neighborhood} · ${store.distanceKm === 0 ? 'Cluster Hub' : `${store.distanceKm} km away`}
          </div>
          <div style="border-top: 1px solid #DFE7EB; padding-top: 6px; font-size: 11px;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 3px;">
              <span style="color: #607087;">Pledged ${targetSKU}:</span>
              <strong style="color: #0BA69C; font-family: monospace;">${store.proteinOatsCommitment} units</strong>
            </div>
            <div style="display: flex; justify-content: space-between;">
              <span style="color: #607087;">Lost Inquiries Logged:</span>
              <strong style="font-family: monospace;">${store.totalMissedRequestsLogged}</strong>
            </div>
          </div>
        </div>
      `;

      marker.bindPopup(popupContent);

      marker.on('click', () => {
        onSelectStore(store);
      });

      markers[store.id] = marker;
    });

    markersRef.current = markers;

    // Invalidate map size after layout settles
    const timeout = setTimeout(() => {
      map.invalidateSize();
    }, 250);

    return () => {
      clearTimeout(timeout);
      map.remove();
      mapInstanceRef.current = null;
    };
  }, [stores, onSelectStore, targetSKU]);

  // Center on selected store when changed
  useEffect(() => {
    if (selectedStoreId && markersRef.current[selectedStoreId] && mapInstanceRef.current) {
      const selected = stores.find(s => s.id === selectedStoreId);
      if (selected) {
        mapInstanceRef.current.panTo([selected.lat, selected.lng], { animate: true });
        markersRef.current[selectedStoreId].openPopup();
      }
    }
  }, [selectedStoreId, stores]);

  return (
    <div className="relative w-full h-[380px] sm:h-[440px] rounded-2xl overflow-hidden border border-[#DFE7EB] shadow-xs">
      {/* Map Target Container */}
      <div ref={mapContainerRef} className="w-full h-full z-0" />

      {/* Map Legend Overlay */}
      <div className="absolute bottom-3 left-3 z-[400] bg-white/95 backdrop-blur-md px-3 py-2 rounded-xl border border-slate-200/80 shadow-md text-xs font-mono space-y-1 pointer-events-auto">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#0B1730] border border-[#31D5CD]" />
          <span className="text-[#0B1730] font-semibold">Your Store (Hub)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#0BA69C]" />
          <span className="text-slate-600">Neighbor Kirana ({stores.length - 1})</span>
        </div>
        <div className="flex items-center gap-2 pt-1 border-t border-slate-100 text-[10px] text-slate-400">
          <span className="w-3 h-0.5 border-t border-dashed border-[#0BA69C]" />
          <span>2.5 km Group Buying Radius</span>
        </div>
      </div>
    </div>
  );
};
