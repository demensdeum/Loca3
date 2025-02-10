import React, { useState, useEffect } from 'react';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { View, Text, TextInput, TouchableOpacity, FlatList, Modal } from 'react-native';
import { StyleSheet } from 'react-native';
import sharedStyles from '../styles';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../ThemeContext';
import { useTranslation } from 'react-i18next';
import Ionicons from 'react-native-vector-icons/Ionicons';

import { Place } from '../types';

type RootStackParamList = {
  PlacesList: undefined;
  Map: undefined;
};

type PlacesScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'PlacesList'>;

interface Props {
  navigation: PlacesScreenNavigationProp;
}

const PlacesScreen: React.FC<Props> = ({ navigation }) => {
  const { theme, isDark } = useTheme();
  const [isDeleteModalVisible, setDeleteModalVisible] = useState<boolean>(false);
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  
  const styles = StyleSheet.create({
    ...sharedStyles,
    modalContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: theme.modalOverlay,
    },
    container: {
      flex: 1,
      padding: 16,
      backgroundColor: theme.background,
    },
    modalContent: {
      width: 320,
      padding: 20,
      backgroundColor: theme.modalBackground,
      borderColor: theme.border,
      borderWidth: 1,
    },
    modalTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      marginBottom: 15,
      color: theme.text,
    },
    modalText: {
      color: theme.text,
      marginBottom: 20,
      textAlign: 'center',
    },
    input: {
      width: '100%',
      borderWidth: 1,
      padding: 10,
      borderRadius: 5,
      marginBottom: 10,
      color: theme.text,
      backgroundColor: isDark ? theme.rowBackground : theme.background,
      borderColor: theme.border,
    },
    listContainer: {
      flex: 1,
    },
    list: {
      flex: 1,
    },
    buttonContainer: {
      position: 'absolute',
      bottom: 20,
      left: 20,
      right: 20,
      flexDirection: 'row',
      justifyContent: 'space-between',
      gap: 10,
    },
    mapButton: {
      flex: 1,
      backgroundColor: theme.buttonBackground,
      padding: 12,
      borderRadius: 8,
      alignItems: 'center',
      marginBottom: 16,
      flexDirection: 'row',
      justifyContent: 'center',
    },
    addButton: {
      flex: 1,
      backgroundColor: theme.buttonBackground,
      padding: 12,
      borderRadius: 8,
      alignItems: 'center',
      marginBottom: 16,
      flexDirection: 'row',
      justifyContent: 'center',
    },
    buttonText: {
      color: theme.buttonText,
      fontWeight: 'bold',
      marginLeft: 8,
    },
    modalButtons: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      width: '100%',
      marginTop: 16,
    },
    cancelButton: {
      backgroundColor: theme.danger,
      padding: 12,
      borderRadius: 5,
      alignItems: 'center',
      flex: 1,
      marginRight: 8,
    },
    saveButton: {
      backgroundColor: theme.buttonBackground,
      padding: 12,
      borderRadius: 5,
      alignItems: 'center',
      flex: 1,
      marginLeft: 8,
    },
    cancelButtonText: {
      color: theme.buttonText,
      fontWeight: 'bold',
    },
    saveButtonText: {
      color: theme.buttonText,
      fontWeight: 'bold',
    },
    placeItem: {
      backgroundColor: theme.rowBackground,
      padding: 16,
      borderRadius: 8,
      marginBottom: 8,
      borderColor: theme.border,
      borderWidth: 1,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },

    placeText: {
      color: theme.text,
      marginBottom: 4,
      fontSize: 16,
    },
    placeAddress: {
      color: theme.text,
      opacity: 0.7,
      fontSize: 14,
    },

    deleteButton: {
      backgroundColor: theme.buttonBackground,
      padding: 8,
      borderRadius: 5,
      alignItems: 'center',
      justifyContent: 'center',
    },
  });
  const { t } = useTranslation();
  const [places, setPlaces] = useState<Place[]>([]);
  const [newPlace, setNewPlace] = useState<{ name: string; address: string; latitude?: number; longitude?: number }>({ 
    name: '', 
    address: '', 
    latitude: undefined, 
    longitude: undefined 
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

  useEffect(() => {
    loadPlaces();
  }, []);

  const loadPlaces = async () => {
    try {
      const savedPlaces = await AsyncStorage.getItem('places');
      if (savedPlaces) {
        setPlaces(JSON.parse(savedPlaces));
      }
    } catch (error) {
      console.error('Error loading places:', error);
    }
  };

  const savePlaces = async (updatedPlaces: Place[]) => {
    try {
      await AsyncStorage.setItem('places', JSON.stringify(updatedPlaces));
      setPlaces(updatedPlaces);
    } catch (error) {
      console.error('Error saving places:', error);
    }
  };

  const addPlace = async () => {
    if (newPlace.name.trim() && newPlace.address.trim()) {
      try {
        // Try to geocode the address to get coordinates
        const response = await fetch(
          `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
            newPlace.address
          )}&key=YOUR_GOOGLE_MAPS_API_KEY`
        );
        const data = await response.json();

        let latitude, longitude;
        if (data.results && data.results[0] && data.results[0].geometry) {
          latitude = data.results[0].geometry.location.lat;
          longitude = data.results[0].geometry.location.lng;
        }

        const newPlaces = [...places, { 
          ...newPlace, 
          id: Date.now().toString(),
          latitude,
          longitude
        }];
        
        savePlaces(newPlaces);
        setNewPlace({ name: '', address: '', latitude: undefined, longitude: undefined });
        setIsModalVisible(false);
      } catch (error) {
        console.error('Error geocoding address:', error);
        // Add place without coordinates if geocoding fails
        const newPlaces = [...places, { ...newPlace, id: Date.now().toString() }];
        savePlaces(newPlaces);
        setNewPlace({ name: '', address: '', latitude: undefined, longitude: undefined });
        setIsModalVisible(false);
      }
    }
  };

  const editPlace = (place: Place) => {
    setSelectedPlace(place);
    setNewPlace({ 
      name: place.name, 
      address: place.address,
      latitude: place.latitude,
      longitude: place.longitude
    });
    setEditingId(place.id);
    setIsModalVisible(true);
  };

  const confirmDelete = (place: Place) => {
    setSelectedPlace(place);
    setDeleteModalVisible(true);
  };

  const updatePlace = async () => {
    if (editingId && newPlace.name.trim() && newPlace.address.trim()) {
      try {
        // Try to geocode the new address to get coordinates
        const response = await fetch(
          `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
            newPlace.address
          )}&key=YOUR_GOOGLE_MAPS_API_KEY`
        );
        const data = await response.json();

        let latitude, longitude;
        if (data.results && data.results[0] && data.results[0].geometry) {
          latitude = data.results[0].geometry.location.lat;
          longitude = data.results[0].geometry.location.lng;
        }

        const updatedPlaces = places.map(place =>
          place.id === editingId
            ? { 
                ...place, 
                name: newPlace.name, 
                address: newPlace.address,
                latitude,
                longitude
              }
            : place
        );

        savePlaces(updatedPlaces);
        setEditingId(null);
        setNewPlace({ name: '', address: '', latitude: undefined, longitude: undefined });
        setIsModalVisible(false);
      } catch (error) {
        console.error('Error geocoding address:', error);
        // Update place without coordinates if geocoding fails
        const updatedPlaces = places.map(place =>
          place.id === editingId
            ? { 
                ...place, 
                name: newPlace.name, 
                address: newPlace.address 
              }
            : place
        );
        savePlaces(updatedPlaces);
        setEditingId(null);
        setNewPlace({ name: '', address: '', latitude: undefined, longitude: undefined });
        setIsModalVisible(false);
      }
    }
  };

  const deletePlace = () => {
    if (selectedPlace) {
      const updatedPlaces = places.filter(place => place.id !== selectedPlace.id);
      savePlaces(updatedPlaces);
      setSelectedPlace(null);
      setDeleteModalVisible(false);
    }
  };



  return (
    <View style={styles.container}>
      <View style={styles.listContainer}>

      <Modal visible={isModalVisible} transparent animationType="fade">
        <View style={[styles.modalContainer]}>
          <View style={[styles.modalContent, { backgroundColor: theme.background }]}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>
              {editingId ? t('Edit Place') : t('Add New Place')}
            </Text>
            <TextInput
              style={[styles.input, { backgroundColor: theme.background, color: theme.text }]}
              placeholder={t('Enter Name')}
              placeholderTextColor={theme.placeholderText}
              value={newPlace.name}
              onChangeText={text => setNewPlace({ ...newPlace, name: text })}
            />
            <TextInput
              style={[styles.input, { backgroundColor: theme.background, color: theme.text }]}
              placeholder={t('Enter Address')}
              placeholderTextColor={theme.placeholderText}
              value={newPlace.address}
              onChangeText={text => setNewPlace({ ...newPlace, address: text })}
            />
            <View style={[styles.buttonRow, { marginTop: 16 }]}>
              <TouchableOpacity
                style={[styles.saveButton, { backgroundColor: theme.buttonBackground, flex: 1, marginRight: 5 }]}
                onPress={editingId ? updatePlace : addPlace}
              >
                <Text style={[styles.saveButtonText, { color: theme.buttonText }]}>{t('Save')}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.cancelButton, { backgroundColor: theme.buttonBackground, flex: 1, marginLeft: 5 }]}
                onPress={() => {
                  setIsModalVisible(false);
                  setNewPlace({ name: '', address: '' });
                  setEditingId(null);
                }}
              >
                <Text style={[styles.cancelButtonText, { color: theme.buttonText }]}>{t('Cancel')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={isDeleteModalVisible} transparent animationType="fade">
        <View style={[styles.modalContainer]}>
          <View style={[styles.modalContent, { backgroundColor: theme.background }]}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>{t('Delete Place')}</Text>
            <Text style={[styles.modalText, { color: theme.text }]}>{t('Are you sure you want to delete')} {selectedPlace?.name}?</Text>
            <View style={[styles.buttonRow, { marginTop: 16 }]}>
              <TouchableOpacity 
                style={[styles.saveButton, { backgroundColor: theme.buttonBackground, flex: 1, marginRight: 5 }]}
                onPress={deletePlace}
              >
                <Text style={[styles.saveButtonText, { color: theme.buttonText }]}>{t('Delete')}</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.cancelButton, { backgroundColor: theme.buttonBackground, flex: 1, marginLeft: 5 }]}
                onPress={() => setDeleteModalVisible(false)}
              >
                <Text style={[styles.cancelButtonText, { color: theme.buttonText }]}>{t('Cancel')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <FlatList
        style={styles.list}
        data={places}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.placeItem]}
            onPress={() => editPlace(item)}
          >
            <View>
              <Text style={styles.placeText}>{item.name}</Text>
              <Text style={styles.placeAddress}>{item.address}</Text>
            </View>
            <TouchableOpacity 
              style={styles.deleteButton}
              onPress={() => confirmDelete(item)}
            >
              <Ionicons name="trash" size={18} color={theme.buttonText} />
            </TouchableOpacity>
          </TouchableOpacity>
        )}
      />
      </View>
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.mapButton, { backgroundColor: theme.buttonBackground }]}
          onPress={() => navigation.navigate('Map')}
        >
          <Ionicons name="map-outline" size={24} color={theme.buttonText} />
          <Text style={[styles.buttonText, { color: theme.buttonText }]}>{t('View Map')}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: theme.buttonBackground }]}
          onPress={() => {
            setEditingId(null);
            setNewPlace({ name: '', address: '', latitude: undefined, longitude: undefined });
            setIsModalVisible(true);
          }}
        >
          <Ionicons name="add" size={24} color={theme.buttonText} />
          <Text style={[styles.buttonText, { color: theme.buttonText }]}>{t('Add Place')}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default PlacesScreen;
