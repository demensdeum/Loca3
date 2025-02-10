import React, { useEffect } from 'react';

import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../ThemeContext';

interface Props {
  places: Array<{
    id: string;
    name: string;
    address: string;
    latitude?: number;
    longitude?: number;
  }>;
  initialRegion?: {
    latitude: number;
    longitude: number;
    latitudeDelta: number;
    longitudeDelta: number;
  };
  onRegionChangeComplete?: (region: any) => void;
}

declare global {
  interface Window {
    ymaps: any;
  }
}

const Map: React.FC<Props> = React.memo(({ places, initialRegion }) => {
  const { theme } = useTheme();

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://api-maps.yandex.ru/2.1/?lang=en_US&apikey=your-api-key';
    script.async = true;
    
    script.onload = () => {
      window.ymaps.ready(() => {
        const map = new window.ymaps.Map('ymap-container', {
          center: [initialRegion?.latitude || 55.751574, initialRegion?.longitude || 37.573856],
          zoom: 12,
          controls: ['zoomControl', 'fullscreenControl']
        });

        const geocodeAndAddMarker = async (place: any) => {
          try {
            // If we already have coordinates, use them
            if (place.latitude && place.longitude) {
              const placemark = new window.ymaps.Placemark([place.latitude, place.longitude], {
                balloonContent: `<h3>${place.name}</h3><p>${place.address}</p>`
              });
              map.geoObjects.add(placemark);
              return;
            }

            // Otherwise, geocode the address
            const geocodeResult = await window.ymaps.geocode(place.address);
            const firstGeoObject = geocodeResult.geoObjects.get(0);

            if (firstGeoObject) {
              const coords = firstGeoObject.geometry.getCoordinates();
              const placemark = new window.ymaps.Placemark(coords, {
                balloonContent: `<h3>${place.name}</h3><p>${place.address}</p>`
              });
              map.geoObjects.add(placemark);

              // Adjust map bounds to show all markers
              map.setBounds(map.geoObjects.getBounds(), {
                checkZoomRange: true,
                zoomMargin: 50
              });
            }
          } catch (error) {
            console.error('Geocoding error for address:', place.address, error);
          }
        };

        // Process all places
        places.forEach(place => geocodeAndAddMarker(place));
      });
    };

    document.head.appendChild(script);

    return () => {
      const mapContainer = document.getElementById('ymap-container');
      if (mapContainer) {
        mapContainer.innerHTML = '';
      }
    };
  }, [places, initialRegion]);

  return (
    <View style={styles.container}>
      <div 
        id="ymap-container" 
        style={{ 
          width: '100%', 
          height: '100vh',
          background: theme.isDark ? '#242f3e' : '#fff'
        }} 
      />
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    height: '100%',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0
  }
});

export default Map;
