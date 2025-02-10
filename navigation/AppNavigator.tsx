import React, { useState } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import ContactsScreen from '../screens/ContactsScreen';
import PasswordScreen from '../screens/PasswordScreen';
import SettingsScreen from '../screens/SettingsScreen';
import PlacesScreen from '../screens/PlacesScreen';
import MapScreen from '../screens/MapScreen';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useTranslation } from "react-i18next";
import { useTheme } from '../ThemeContext'

const Tab = createBottomTabNavigator();
const PlacesStack = createNativeStackNavigator();

const AppNavigator: React.FC = () => {
    const { theme } = useTheme();
    const { t } = useTranslation();  
    const [refreshFlag, setRefreshFlag] = useState(false);
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false, // Hide the header if not needed
          tabBarIcon: ({ color, size }) => {
            let iconName: string = 'ellipse'; // Default icon

            if (route.name === t('Contacts')) {
              iconName = 'person-outline';
            } else if (route.name === t('Passwords')) {
              iconName = 'lock-closed-outline';
            } else if (route.name === t('Settings')) {
              iconName = 'settings-outline';
            } else if (route.name === t('Places')) {
              iconName = 'location-outline';
            }

            return <Ionicons name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: theme.buttonBackground,
          tabBarInactiveTintColor: theme.text,
          tabBarStyle: {
            backgroundColor: theme.background,
            borderTopWidth: 0,
          },
        })}
      >
<Tab.Screen name={t("Contacts")}>
    {() => <ContactsScreen refreshFlag={refreshFlag} />}
</Tab.Screen>
        <Tab.Screen name={t("Passwords")} component={PasswordScreen} />
<Tab.Screen name={t("Settings")}>
    {() => <SettingsScreen setRefreshFlag={setRefreshFlag} />}
</Tab.Screen>
        <Tab.Screen 
          name={t("Places")} 
          options={{
            headerShown: false
          }}
        >
          {() => (
            <PlacesStack.Navigator>
              <PlacesStack.Screen 
                name="PlacesList" 
                component={PlacesScreen}
                options={{
                  headerShown: false
                }}
              />
              <PlacesStack.Screen 
                name="Map" 
                component={MapScreen}
                options={{
                  title: t('Map'),
                  headerStyle: {
                    backgroundColor: theme.background,
                  },
                  headerTintColor: theme.text,
                }}
              />
            </PlacesStack.Navigator>
          )}
        </Tab.Screen>
      </Tab.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
