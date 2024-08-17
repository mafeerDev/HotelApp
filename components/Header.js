import React from 'react'
import { Pressable, Text, View, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const Header = () => {
  const navigation = useNavigation();
  const goToSavedScreen = () => {
    navigation.navigate('SavedScreen');
  };
  const goToHotels = () => {
    navigation.navigate('HotelesSearch');
  };
  const goToVuelos = () => {
    navigation.navigate('Vuelos');
  };
  const goToRes = () => {
    navigation.navigate('Reservas');
  };
  return (
    <View style={styles.Vista1}>
      <Pressable style={styles.Boton1}>
        <Text style={styles.Texto}>Stays</Text>
      </Pressable>

      <Pressable onPress={goToHotels} style={styles.Boton2}>
        <Ionicons name="star" size={26} color="white" />
        <Text style={styles.Texto}>Score</Text>
      </Pressable>

      <Pressable onPress={goToVuelos} style={styles.Boton2}>
        <Ionicons name="airplane" size={26} color="white" />
        <Text style={styles.Texto}>AirPorts</Text>
      </Pressable>

      <Pressable onPress={goToRes} style={styles.Boton2}>
        <Ionicons name="bed" size={26} color="white" />
        <Text style={styles.Texto}>Reservas</Text>
      </Pressable>
    </View>
  )
}

const styles = StyleSheet.create({
  Vista1: {
    backgroundColor: "#0C3B2E", height: 65, flexDirection: "row", 
    alignItems: "center", justifyContent: "space-around",
  },
  Boton1: {
    flexDirection: "row", alignItems: "center", 
     borderRadius: 25, padding: 8,
  },
  Boton2: {
    flexDirection: "row", alignItems: "center",
  },
  Texto: {
    marginLeft: 8, fontWeight: "bold", color: "white", 
    fontSize: 15,
  }
})
export default Header
