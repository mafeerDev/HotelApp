import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, FlatList, Button } from "react-native";
import { firebase } from "../../config";
import { useNavigation } from "@react-navigation/native";
import { Entypo } from "@expo/vector-icons";

const VerReserva = () => {
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
  const [reservations, setReservations] = useState([]);
  const navigation = useNavigation();

  useEffect(() => {
    configureHeader();
    const fetchReservations = async () => {
      try {
        const currentUser = firebase.auth().currentUser;
        if (!currentUser) {
          console.log("Usuario no autenticado.");
          return;
        }

        const db = firebase.firestore();
        const snapshot = await db
          .collection("reservations")
          .where("userId", "==", currentUser.uid)
          .get();

        const reservationsData = [];
        const currentDate = new Date();

        snapshot.forEach((doc) => {
          const data = doc.data();
          const endDate = new Date(data.endDate);
          if (currentDate > endDate) {
            data.status = "vencido";
          }
          reservationsData.push({ id: doc.id, ...data });
        });

        setReservations(reservationsData);
      } catch (error) {
        console.error("Error al obtener las reservas:", error);
      }
    };

    fetchReservations();
  }, []);

  const handleCancelReservation = async (reservationId) => {
    try {
      const db = firebase.firestore();
      await db.collection("reservations").doc(reservationId).delete();
      setReservations((prevReservations) =>
        prevReservations.filter(
          (reservation) => reservation.id !== reservationId
        )
      );
      console.log("Reservación cancelada y eliminada.");
    } catch (error) {
      console.error("Error al cancelar la reservación:", error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Tus Reservas</Text>
      {reservations.length === 0 ? (
        <Text style={styles.noReservationsText}>
          No tienes reservas realizadas.
        </Text>
      ) : (
        <FlatList
          data={reservations}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.reservationCard}>
              <Text style={styles.hotelName}>{item.hotelName}</Text>
              <Text>Inicio: {item.startDate}</Text>
              <Text>Fin: {item.endDate}</Text>
              <Text>Tipo de habitación: {item.roomType}</Text>
              <Text>Total de habitaciones: {item.rooms}</Text>
              <Text>Estado: {item.status}</Text>
              <Button
                title="Cancelar Reservación"
                onPress={() => handleCancelReservation(item.id)}
                color={"#0C3B2E"}
              />
            </View>
          )}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  noReservationsText: {
    fontSize: 18,
    fontStyle: "italic",
  },
  reservationCard: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
  },
  hotelName: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 5,
  },
});

export default VerReserva;
