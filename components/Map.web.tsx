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
    script.src = 'https://api-maps.yandex.ru/2.1/?lang=en_US';
    script.async = true;
    
    script.onload = () => {
      window.ymaps.ready(() => {
        const map = new window.ymaps.Map('ymap-container', {
          center: [initialRegion?.latitude || 55.751574, initialRegion?.longitude || 37.573856],
          zoom: 12,
          controls: ['zoomControl', 'fullscreenControl']
        });

        places.forEach(place => {
          if (place.latitude && place.longitude) {
            const placemark = new window.ymaps.Placemark([place.latitude, place.longitude], {
              balloonContent: `<h3>${place.name}</h3><p>${place.address}</p>`
            });
            map.geoObjects.add(placemark);
          }
        });
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
