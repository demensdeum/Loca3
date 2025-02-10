import React, { useState, useEffect } from 'react';
import * as Location from 'expo-location';
import { View, StyleSheet, Dimensions } from 'react-native';
import Map from '../components/Map';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Place } from '../types';
import { useTheme } from '../ThemeContext';

const MapScreen: React.FC = () => {
  const { theme } = useTheme();
  const [places, setPlaces] = useState<Place[]>([]);
  const [region, setRegion] = useState({
    latitude: 37.78825,
    longitude: -122.4324,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const location = await Location.getCurrentPositionAsync({});
        setRegion({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        });
      }
      loadPlaces();
    })();
  }, []);

  const loadPlaces = async () => {
    try {
      const storedPlaces = await AsyncStorage.getItem('@places_list');
      if (storedPlaces) {
        setPlaces(JSON.parse(storedPlaces));
      }
    } catch (error) {
      console.error('Failed to load places:', error);
    }
  };

  return (
    <View style={styles.container}>
      <Map
        places={places}
        initialRegion={region}
        onRegionChangeComplete={setRegion}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});

export default MapScreen;
