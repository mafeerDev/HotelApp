import React, { useState, useEffect } from 'react';
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialIcons, MaterialCommunityIcons, Entypo, Ionicons } from '@expo/vector-icons';
import { TouchableOpacity, Text } from 'react-native';

import { firebase } from './config';
import Login from "./screens/Login";
import Registration from "./screens/Registration";
import Dashboard from "./screens/Dashboard";
import ImagePickerExample from "./screens/Image";
import ProfileUser from "./screens/ProfileUser";
import Lol from "./screens/Lol";
import HomeScreen from "./screens/HomeScreen";
import Rooms from "./screens/Rooms";
import ResultScreen from "./screens/ApiSearch/ResultScreen";
import CitySearch from "./screens/ApiSearch/CitySearch";
import TakePhoto from './screens/TakePhoto';
import Reservar from './screens/ApiSearch/Reservar';
import HotelesSearch from './screens/ApiSearch/HotelesSearch';
import Calificar from './screens/ApiSearch/Calificar';
import Vuelos from './screens/ApiSearch/Vuelos';
import Favs from './screens/ApiSearch/Favs';
import VerReserva from './screens/ApiSearch/VerReserva';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

function HomeStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Rooms" component={Rooms} />
      <Stack.Screen name="ResultScreen" component={ResultScreen} options={{ headerShown: false }}/>
      <Stack.Screen name="CitySearch" component={CitySearch} />
      <Stack.Screen name="Tomar" component={TakePhoto} options={{ headerShown: false }}/>
      <Stack.Screen name="Reservar" component={Reservar} options={{ headerShown: false }}/>
      <Stack.Screen name="HotelesSearch" component={HotelesSearch} options={{ headerShown: false }}/>
      <Stack.Screen name="Calificar" component={Calificar}/>
      <Stack.Screen name="Vuelos" component={Vuelos}/>
      <Stack.Screen name="Reservas" component={VerReserva}/>
  
    </Stack.Navigator>
  );
}

function ProfileStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Profile" component={ProfileUser} options={{ headerShown: false }} />
    </Stack.Navigator>
  );
}

function AuthStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Lol" component={Lol} options={{ headerShown: false }} />
      <Stack.Screen name="Login" component={Login} options={{ headerShown: false }} />
      <Stack.Screen name="Registration" component={Registration} options={{ headerShown: false }} />
      <Stack.Screen name="ImagePickerExample" component={ImagePickerExample} />

    </Stack.Navigator>
  );
}

function BottomTabs() {
  return (
    <Tab.Navigator>
      <Tab.Screen 
        name="HomeScreen" 
        component={HomeStack}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ focused }) =>
            focused ? (
              <MaterialCommunityIcons name="home-circle" size={24} color="#6d9773" />
            ) : (
              <Entypo name="home" size={24} color="black" />
            ),
        headerShown: false
        }}
      />
      
      <Tab.Screen 
        name="Favs" 
        component={Favs}
        options={{
          tabBarLabel: 'Favs',
          tabBarIcon: ({ focused }) =>
            focused ? (
              <Ionicons name="heart" size={24} color="#6d9773" />
            ) : (
              <Ionicons name="heart" size={24} color="black" />
            ),
        }}
      />
      <Tab.Screen 
        name="ProfileUser" 
        component={ProfileStack}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({ focused }) =>
            focused ? (
              <Ionicons name="person-circle" size={24} color="#6d9773" />
            ) : (
              <Ionicons name="person" size={24} color="black" />
            ),
        }}
      />
       
    </Tab.Navigator>
  );
}

export default function App() {
  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const subscriber = firebase.auth().onAuthStateChanged(onAuthStateChanged);
    return subscriber; // Unsubscribe on unmount
  }, []);

  function onAuthStateChanged(user) {
    setUser(user);
    if (initializing) setInitializing(false);
  }

  if (initializing) return null;

  return (
    <NavigationContainer>
      {user ? (
        <BottomTabs />
      ) : (
        <AuthStack />
      )}
    </NavigationContainer>
  );
};