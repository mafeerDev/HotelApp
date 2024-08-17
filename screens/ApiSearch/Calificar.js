import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  Image,
  TouchableOpacity,
  Alert,
  ScrollView,
} from "react-native";
import { firebase } from "../../config";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Entypo, AntDesign } from "@expo/vector-icons";

const Calificar = () => {
  const [comment, setComment] = useState("");
  const [userId, setUserId] = useState("");
  const [userName, setUserName] = useState(""); 
  const [hotel, setHotel] = useState(null);
  const navigation = useNavigation();
  const route = useRoute();
  const hotelData = route.params.hotel;
  const [rating, setRating] = useState(0);
  const [opiniones, setOpiniones] = useState([]);
  const [loadingOpiniones, setLoadingOpiniones] = useState(true);

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
    if (hotelData) {
      setHotel(hotelData);
    }
    fetchUserId();
  }, [hotelData]);

  useEffect(() => {
    if (hotel) {
      fetchOpiniones();
    }
  }, [hotel]);

  const fetchUserId = async () => {
    const user = firebase.auth().currentUser;
    if (user) {
      setUserId(user.uid);
      setUserName(user.displayName || "Nombre de usuario"); 
    } else {
      console.error("No hay un usuario autenticado");
    }
  };

  const fetchOpiniones = async () => {
    const db = firebase.firestore();
    try {
      const opinionesSnapshot = await db
        .collection("opiniones")
        .where("hotelId", "==", hotel.id)
        .get();

      const opinionesData = opinionesSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      await Promise.all(
        opinionesData.map(async (opinion) => {
          if (opinion.userId) {
            const userDoc = await db.collection("users").doc(opinion.userId).get();
            if (userDoc.exists) {
              opinion.userName = userDoc.data().displayName || "Anónimo";
            } else {
              opinion.userName = "Anónimo";
            }
          } else {
            opinion.userName = "Anónimo";
          }
        })
      );

      setOpiniones(opinionesData);
      setLoadingOpiniones(false);
    } catch (error) {
      console.error("Error al obtener opiniones:", error);
      setLoadingOpiniones(false);
    }
  };

  const handleSendReview = async () => {
    if (!userId || !hotel) {
      console.error("No se pudo obtener el ID del usuario o los datos del hotel");
      return;
    }

    const db = firebase.firestore();
    try {
      const opinionQuery = await db
        .collection("opiniones")
        .where("userId", "==", userId)
        .where("hotelId", "==", hotel.id)
        .get();

      if (!opinionQuery.empty) {
        Alert.alert(
          "Ya has puntuado este hotel",
          "¿Deseas cambiar tu opinión?",
          [
            {
              text: "Cancelar",
              style: "cancel",
            },
            {
              text: "Aceptar",
              onPress: async () => {
                const existingOpinionId = opinionQuery.docs[0].id;
                await db
                  .collection("opiniones")
                  .doc(existingOpinionId)
                  .update({
                    comment: comment,
                    rating: rating,
                  });
                console.log("Opinión actualizada con éxito");
                navigation.goBack();
              },
            },
          ]
        );
      } else {
        await db.collection("opiniones").add({
          userId: userId,
          hotelId: hotel.id,
          comment: comment,
          rating: rating,
          createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        });
        console.log("Nueva opinión guardada con éxito");
        navigation.goBack();
      }
    } catch (error) {
      console.error("Error al guardar o actualizar la opinión:", error);
    }
  };

  const renderStars = () => {
    const maxStars = 5;
    let stars = [];
    for (let i = 1; i <= maxStars; i++) {
      stars.push(
        <TouchableOpacity key={i} onPress={() => handleRating(i)}>
          <AntDesign
            name={i <= rating ? "star" : "staro"}
            size={30}
            color={i <= rating ? "#FFD700" : "#ccc"}
            style={{ marginRight: 5 }}
          />
        </TouchableOpacity>
      );
    }
    return stars;
  };

  const renderStars2 = (nom) => {
    const maxStars = 5;
    let stars = [];
    for (let i = 1; i <= maxStars; i++) {
      stars.push(
        <AntDesign
          key={i}
          name={i <= nom ? "star" : "staro"}
          size={20}
          color={i <= nom ? "#FFD700" : "#ccc"}
          style={{ marginRight: 5 }}
        />
      );
    }
    return stars;
  };
  

  const handleRating = (ratingValue) => {
    setRating(ratingValue);
  };

  if (!hotel) {
    return <Text>Cargando...</Text>;
  }

  return (
    <ScrollView style={styles.container}>
      <Image source={{ uri: hotel.imageUrl }} style={styles.image} />
      <Text style={styles.hotelName}>{hotel.name}</Text>

      <Text style={styles.label}>Tu opinión:</Text>
      <TextInput
        style={styles.input}
        placeholder="Escribe tu opinión"
        value={comment}
        onChangeText={setComment}
      />

      <View style={styles.ratingContainer}>
        <Text style={styles.label}>Tu calificación:</Text>
        <View style={{ flexDirection: "row" }}>{renderStars()}</View>
      </View>

      <TouchableOpacity style={styles.sendButton} onPress={handleSendReview}>
        <Text style={styles.sendButtonText}>Enviar</Text>
      </TouchableOpacity>

      <View style={styles.opinionesContainer}>
        <Text style={styles.label}>Opiniones de otros usuarios:</Text>
        {loadingOpiniones ? (
          <Text>Cargando opiniones...</Text>
        ) : (
          opiniones.map((opinion) => (
            <View key={opinion.id} style={styles.opinionItem}>
              <Text style={styles.opinionUserName}>{opinion.userName || 'Anónimo'}</Text>
              <Text style={styles.opinionText}>{opinion.comment || ''}</Text>
              <Text>Calificación: {renderStars2(opinion.rating) || ''}</Text>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  image: {
    width: "100%",
    height: 200,
    borderRadius: 10,
    marginBottom: 20,
  },
  hotelName: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
    color: "#333",
  },
  label: {
    fontSize: 18,
    marginBottom: 10,
    color: "#333",
  },
  input: {
    height: 100,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
    marginBottom: 20,
    textAlignVertical: "top",
    fontSize: 16,
    color: "#333",
    backgroundColor: "#f9f9f9",
  },
  ratingContainer: {
    marginBottom: 20,
  },
  sendButton: {
    backgroundColor: "#0C3B2E",
    paddingVertical: 12,
    borderRadius: 5,
    alignItems: "center",
    marginBottom: 20,
  },
  sendButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  opinionesContainer: {
    marginTop: 20,
    marginBottom: 30,
  },
  opinionItem: {
    marginBottom: 10,
    padding: 10,
    backgroundColor: "#fff",
    borderRadius: 5,
    borderColor: "#ccc",
    borderWidth: 1,
  },
  opinionesContainer: {
    marginTop: 20,
    marginBottom: 30,
  },
  opinionItem: {
    marginBottom
    : 10,
    padding: 10,
    backgroundColor: "#fff",
    borderRadius: 15,
    borderColor: "#6d9773",
    borderWidth: 3,
  },
  opinionUserName: {
    marginBottom: 5,
    fontWeight: "bold",
    fontSize: 18,
    textAlign:"right",
  },
  opinionText: {
    fontSize: 18,
    marginBottom: 5,
  },
});

export default Calificar;
