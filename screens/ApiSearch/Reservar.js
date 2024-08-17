import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  TextInput,
  Alert,
  ScrollView,
} from "react-native";
import { Entypo } from "@expo/vector-icons";
import { firebase } from "../../config";
import { AntDesign } from '@expo/vector-icons';
import { useNavigation, useRoute } from "@react-navigation/native";

const Reservar = ({ route, navigation }) => {
  const { hotel, rooms: Norooms, startDate: initialStartDate, endDate: initialEndDate } = route.params;
  const [startDate, setStartDate] = useState(initialStartDate);
  const [endDate, setEndDate] = useState(initialEndDate);
  const [rooms, setRooms] = useState(Norooms);
  const [selectedRoomType, setSelectedRoomType] = useState("individual");

  const configureHeader = () => {
    navigation.setOptions({
      headerShown: true,
      title: "Booking",
      headerTitleStyle: {
        fontSize: 25,
        fontWeight: "bold",
        color: "white",
        textAlign: "center",
      },
      headerLeft: null,
      headerStyle: {
        backgroundColor: "#0C3B2E",
        height: 120,
        borderBottomColor: "transparent",
        shadowColor: "transparent",
      },
      headerRight: () => (
        <Entypo
          name="emoji-happy"
          size={24}
          color="#FFBA00"
          style={{ marginRight: 12 }}
        />
      ),
    });
  };

  useEffect(() => {
    configureHeader();
  }, []);
  const handleReserve = async () => {
    if (!startDate || !endDate) {
      Alert.alert("Error", "Por favor selecciona fechas válidas para la reserva.");
      return;
    }
  
    try {
      const currentDate = new Date();
      const startDateObj = new Date(startDate);
      const endDateObj = new Date(endDate);
  
      if (startDateObj < currentDate || endDateObj < currentDate) {
        Alert.alert("Error", "Las fechas de inicio y fin no pueden ser menores que la fecha actual.");
        return;
      }
  
      const currentUser = firebase.auth().currentUser;
      if (!currentUser) {
        Alert.alert("Error", "No estás autenticado. Por favor inicia sesión.");
        return;
      }
  
      const reservationData = {
        hotelId: hotel.id,
        hotelName: hotel.name,
        startDate,
        endDate,
        roomType: selectedRoomType,
        rooms: rooms,
        status: "vigente",
        userId: currentUser.uid
      };
  
      const db = firebase.firestore();
      await db.collection("reservations").add(reservationData);
      Alert.alert("Éxito", "¡Reserva realizada con éxito!");
      navigation.goBack();
    } catch (error) {
      console.error("Error al realizar la reserva:", error);
      Alert.alert("Error", "Ocurrió un error al realizar la reserva. Por favor intenta de nuevo más tarde.");
    }
  };
  

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Image source={{ uri: hotel.imageUrl }} style={styles.image} />
        <View style={styles.detailsContainer}>
          <Text style={styles.hotelName}>{hotel.name}</Text>
          <Text>Estrellas: {"⭐".repeat(hotel.stars)}</Text>
          <Text>Precio por noche: ${hotel.pricePerNight}</Text>
          <Text>Ubicación: {hotel.location}</Text>
          <Text>Descripción: {hotel.description}</Text>

          <View style={styles.specificationsContainer}>
            <Text style={styles.specificationsTitle}>Especificaciones:</Text>
            {hotel.specifications.map((spec) => (
              <View key={spec.id} style={styles.specificationItem}>
                <AntDesign
                  name={spec.icon}
                  size={24}
                  color="#6D9773"
                  style={{ marginRight: 10 }}
                />
                <Text>{spec.name}</Text>
              </View>
            ))}
          </View>
        </View>
        <View style={styles.reserveContainer}>
          <Text style={styles.reserveText}>Fecha de inicio:</Text>
          <TextInput
            style={styles.input}
            placeholder="Fecha de inicio"
            onChangeText={(text) => setStartDate(text)}
            value={startDate}
          />
          <Text style={styles.reserveText}>Fecha de fin:</Text>
          <TextInput
            style={styles.input}
            placeholder="Fecha de fin"
            onChangeText={(text) => setEndDate(text)}
            value={endDate}
          />
          <Text style={styles.reserveText}>Habitaciones:</Text>
          <TextInput
            style={styles.input}
            placeholder="Número de habitaciones"
            onChangeText={(text) => setRooms(text)}
            value={rooms.toString()} // Asegúrate de convertir rooms a string si es un número
          />
          <Text style={styles.reserveText}>Tipo de habitación:</Text>
          <TouchableOpacity
            style={styles.roomTypeButton}
            onPress={() => setSelectedRoomType("individual")}
          >
            <Text style={styles.roomTypeText}>Individual</Text>
            {selectedRoomType === "individual" && (
              <Entypo name="check" size={24} color="green" />
            )}
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.roomTypeButton}
            onPress={() => setSelectedRoomType("shared")}
          >
            <Text style={styles.roomTypeText}>Compartida</Text>
            {selectedRoomType === "shared" && (
              <Entypo name="check" size={24} color="green" />
            )}
          </TouchableOpacity>
          <TouchableOpacity style={styles.reserveButton} onPress={handleReserve}>
            <Text style={styles.reserveButtonText}>Reservar</Text>
            <Entypo name="arrow-with-circle-right" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  image: {
    width: "100%",
    height: 200,
    resizeMode: "cover",
  },
  detailsContainer: {
    padding: 20,
  },
  hotelName: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
  },
  reserveContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 50,
  },
  reserveText: {
    fontSize: 18,
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
  },
  roomTypeButton: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  roomTypeText: {
    marginRight: 10,
    fontSize: 16,
  },
  reserveButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ffba00",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 15,
    marginTop: 20,
    marginBottom: 20,
  },
  reserveButtonText: {
    color: "#FFFFFF",
    marginRight: 10,
    fontSize: 18,
    fontWeight: "bold",
  },
  specificationsContainer: {
    marginTop: 20,
  },
  specificationsTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  specificationItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 5,
  },
});

export default Reservar;
