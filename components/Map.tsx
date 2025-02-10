import React from 'react';
import { StyleSheet, Dimensions } from 'react-native';
import MapView, { Marker } from 'react-native-maps';

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

const Map: React.FC<Props> = ({ places, initialRegion, onRegionChangeComplete }) => {
  return (
    <MapView
      style={styles.map}
      initialRegion={initialRegion}
      onRegionChangeComplete={onRegionChangeComplete}
      showsUserLocation={true}
      showsMyLocationButton={true}
    >
      {places.filter(place => place.latitude && place.longitude).map((place) => (
        <Marker
          key={place.id}
          coordinate={{
            latitude: place.latitude!,
            longitude: place.longitude!,
          }}
          title={place.name}
          description={place.address}
        />
      ))}
    </MapView>
  );
};

const styles = StyleSheet.create({
  map: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
  },
});

export default Map;
