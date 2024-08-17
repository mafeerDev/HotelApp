import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Modal,
  Pressable,
  TextInput,
  Image,
} from "react-native";
import axios from "axios";
import { firebase } from "../../config";
import { Entypo, Ionicons, AntDesign } from "@expo/vector-icons";
import Header from "../../components/Header";
import { useNavigation } from "@react-navigation/native";

const Vuelos = ({ route }) => {
  const [activeFilter, setActiveFilter] = useState("price"); 
  const [cityName, setCityName] = useState("");
  const [airports, setAirports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFiltersModal, setShowFiltersModal] = useState(false);
  const [searchAirportName, setSearchAirportName] = useState("");
  const [sortedAirports, setSortedAirports] = useState([]);
  const [sortOrder, setSortOrder] = useState("asc");
  const [sortByNameOrder, setSortByNameOrder] = useState("asc"); 
  const [favorites, setFavorites] = useState([]); 
  const [randomImages, setRandomImages] = useState({});

  const navigation = useNavigation();

  useEffect(() => {
    fetchAirports(capitalizeFirstLetter(cityName));
    configureHeader();
  }, [cityName]);

  useEffect(() => {
    fetchFavorites();
  }, []);

  useEffect(() => {
    fetchRandomImages();
  }, [airports]);

  const fetchAirports = async (cityName) => {
    try {
      const existingAirports = await getAirportsByCityFromFirestore(cityName);
      if (existingAirports.length > 0) {
        setAirports(existingAirports);
        sortAirports(sortOrder, existingAirports);
      } else {
        const params = {
          q: cityName,
          featureCode: "AIRP",
          username: "ferchis26", 
        };
        const url = `http://api.geonames.org/searchJSON?${new URLSearchParams(
          params
        ).toString()}`;
        const response = await axios.get(url);
        const data = response.data;
        if (!data || !data.geonames || data.geonames.length === 0) {
          throw new Error(
            "No se encontraron aeropuertos en la ciudad especificada."
          );
        }

        const limitedData = data.geonames.slice(0, 5);

        const airportsData = await Promise.all(
          limitedData.map(async (airport) => {
            const airportData = {
              id: airport.geonameId,
              name: airport.name,
              description: generateRandomAirportDescription(),
              location: `${airport.name}, ${airport.countryName}`,
            };

            await saveAirportToFirestore(airportData);

            return airportData;
          })
        );

        setAirports(airportsData);
        sortAirports(sortOrder, airportsData);
      }
    } catch (error) {
      console.error("Error al buscar aeropuertos:", error);
    } finally {
      setLoading(false);
    }
  };

  const getAirportsByCityFromFirestore = async (cityName) => {
    try {
      const db = firebase.firestore();
      const snapshot = await db.collection("airportsPreference").get();
      const airports = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        if (data.location.includes(cityName)) {
          airports.push(data);
        }
      });
      return airports;
    } catch (error) {
      console.error(
        `Error al obtener aeropuertos de la ciudad ${cityName} de Firestore:`,
        error
      );
      return [];
    }
  };

  const saveAirportToFirestore = async (airportData) => {
    try {
      const db = firebase.firestore();
      const existingAirport = await db
        .collection("airportsPreference")
        .doc(airportData.id.toString())
        .get();
      if (!existingAirport.exists) {
        airportData.imageUrl = await fetchHotelImage(airportData.name); 
        await db
          .collection("airportsPreference")
          .doc(airportData.id.toString())
          .set(airportData);
        console.log(`Aeropuerto ${airportData.name} guardado en Firestore`);
      } else {
        console.log(`Aeropuerto ${airportData.name} ya existe en Firestore`);
      }
    } catch (error) {
      console.error(
        `Error al guardar aeropuerto ${airportData.name} en Firestore:`,
        error
      );
    }
  };

  const fetchFavorites = async () => {
    try {
      const db = firebase.firestore();
      const uid = firebase.auth().currentUser.uid;
      const favoritesRef = db.collection("favorites").doc(uid);
      const doc = await favoritesRef.get();
      if (doc.exists) {
        setFavorites(doc.data().favorites);
      } else {
        console.log("No hay datos de favoritos para este usuario.");
      }
    } catch (error) {
      console.error("Error al obtener favoritos:", error);
    }
  };

  const toggleFavorite = async (airportId) => {
    try {
      const db = firebase.firestore();
      const uid = firebase.auth().currentUser.uid;
      const favoritesRef = db.collection("favorites").doc(uid);

      let updatedFavorites = [...favorites];

      if (updatedFavorites.includes(airportId)) {
        updatedFavorites = updatedFavorites.filter((id) => id !== airportId);
      } else {
        updatedFavorites.push(airportId);
      }

      await favoritesRef.set({ favorites: updatedFavorites });

      setFavorites(updatedFavorites);
    } catch (error) {
      console.error("Error al actualizar favoritos:", error);
    }
  };

  const fetchHotelImage = async (hotelName) => {
    try {
      const response = await axios.get(
        "https://api.unsplash.com/photos/random",
        {
          params: {
            query: `airport`,
            orientation: "landscape",
            client_id: "ypGbeZFXaNXsiHP77Wk41gcerLfkxlBnsnDBi76vVws",
          },
        }
      );
      return response.data.urls.regular;
    } catch (error) {
      return "https://www.arup.com/globalassets/images/services/planning/airport-planning/plane-at-an-airport-terminal-airport-planning-hero.jpg";
    }
  };

  const fetchRandomImages = async () => {
    try {
      const images = {};
      await Promise.all(
        airports.map(async (airport) => {
          const imageUrl = await fetchHotelImage(airport.name);
          images[airport.id] = imageUrl;
        })
      );
      setRandomImages(images);
    } catch (error) {
      console.error("Error al obtener imágenes aleatorias:", error);
    }
  };
  const generateRandomAirportDescription = () => {
    const descriptions = [
      "Aeropuerto internacional con excelentes servicios y conexiones.",
      "Un lugar estratégico para viajeros de todo el mundo.",
      "Centro de transporte vital para la ciudad y sus alrededores.",
      "Confort y conveniencia en un solo lugar.",
      "Una puerta de entrada al mundo.",
    ];

    const randomIndex = Math.floor(Math.random() * descriptions.length);
    return descriptions[randomIndex];
  };

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

  const openFiltersModal = () => {
    setShowFiltersModal(true);
  };

  const closeFiltersModal = () => {
    setShowFiltersModal(false);
  };

  const capitalizeFirstLetter = (input) => {
    if (input.length === 0) return input;
    return input.charAt(0).toUpperCase() + input.slice(1);
  };

  const sortAirports = (orderBy, airportsToSort) => {
    let sorted = [...airportsToSort];
    if (orderBy === "price") {
      sorted = sorted.sort((a, b) => {
        return parseFloat(a.pricePerNight) - parseFloat(b.pricePerNight);
      });
    } else if (orderBy === "name") {
      sorted = sorted.sort((a, b) => {
        return a.name.localeCompare(b.name);
      });
    }
    setSortedAirports(sorted);
  };

  const applyFilters = () => {
    if (activeFilter === "name") {
      sortAirports(sortByNameOrder, airports);
    } else {
      sortAirports(sortOrder, airports);
    }
    closeFiltersModal();
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>Cargando...</Text>
      </View>
    );
  }
  const renderItem = ({ item }) => {
    const isFavorite = favorites.includes(item.id);
    const imageUrl = item.imageUrl; 

    return (
      <View style={styles.itemContainer}>
        <Image source={{ uri: imageUrl }} style={styles.itemImage} />
        <View style={styles.itemTextContainer}>
          <Text style={styles.itemTitle}>{item.name}</Text>
          <Text style={styles.itemSubtitle}>{item.description}</Text>
          <Text style={styles.itemLocation}>{item.location}</Text>
          <TouchableOpacity
            onPress={() => toggleFavorite(item.id)}
            style={styles.favoriteButton}
          >
            <AntDesign
              name={isFavorite ? "heart" : "hearto"}
              size={24}
              color={isFavorite ? "#ffba00" : "gray"}
            />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Ingrese el nombre de la ciudad"
        value={cityName}
        onChangeText={setCityName}
      />
      <TouchableOpacity style={styles.button} onPress={openFiltersModal}>
        <Text style={styles.buttonText}>Filtros</Text>
      </TouchableOpacity>
      <FlatList
        data={sortedAirports}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        style={styles.list}
      />

      <Modal visible={showFiltersModal} animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Ordenar por:</Text>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => {
                setActiveFilter("price");
                setSortOrder(sortOrder === "asc" ? "desc" : "asc");
              }}
            >
              <Text style={styles.modalButtonText}>
                Precio {sortOrder === "asc" ? "↑" : "↓"}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => {
                setActiveFilter("name");
                setSortByNameOrder(sortByNameOrder === "asc" ? "desc" : "asc");
              }}
            >
              <Text style={styles.modalButtonText}>
                Nombre {sortByNameOrder === "asc" ? "↑" : "↓"}
              </Text>
            </TouchableOpacity>
            <Pressable style={styles.modalCloseButton} onPress={applyFilters}>
              <Text style={styles.modalCloseButtonText}>Aplicar</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  input: {
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
    margin: 10,
    paddingLeft: 8,
  },
  button: {
    backgroundColor: "#0C3B2E",
    padding: 10,
    alignItems: "center",
    margin: 10,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
  },
  list: {
    flex: 1,
  },
  itemContainer: {
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
    padding: 10,
    margin: 10,
    flexDirection: "row",
    alignItems: "center",
  },
  itemImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
    marginRight: 10,
  },
  itemTextContainer: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: "bold",
  },
  itemSubtitle: {
    fontSize: 14,
    color: "gray",
  },
  itemLocation: {
    fontSize: 14,
    color: "gray",
  },
  favoriteButton: {
    top: 1,
    right: 10,
    marginTop: 2,
    padding: 5,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    width: "80%",
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 20,
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 20,
  },
  modalButton: {
    backgroundColor: "#0C3B2E",
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
    alignItems: "center",
    width: "100%",
  },
  modalButtonText: {
    color: "#fff",
    fontSize: 16,
  },
  modalCloseButton: {
    marginTop: 20,
    padding: 10,
    backgroundColor: "#FFBA00",
    borderRadius: 8,
    width: "100%",
    alignItems: "center",
  },
  modalCloseButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#0C3B2E",
  },
});

export default Vuelos;
