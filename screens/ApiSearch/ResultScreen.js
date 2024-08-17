import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Modal,
  Pressable,
  TextInput,
} from "react-native";
import axios from "axios";
import { firebase } from "../../config";
import { Entypo, Ionicons } from "@expo/vector-icons";
import Header from "../../components/Header";
import { useNavigation } from "@react-navigation/native";
import { AntDesign } from "@expo/vector-icons";

const ResultScreen = ({ route }) => {
  const { rooms, startDate, endDate, cityName } = route.params;
  const [activeFilter, setActiveFilter] = useState("price"); // 'price' o 'name'

  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFiltersModal, setShowFiltersModal] = useState(false);
  const [searchHotelName, setSearchHotelName] = useState("");
  const [sortedHotels, setSortedHotels] = useState([]);
  const [sortOrder, setSortOrder] = useState("asc"); // 'asc' para ascendente, 'desc' para descendente por precio
  const [sortByNameOrder, setSortByNameOrder] = useState("asc"); // 'asc' para ascendente, 'desc' para descendente por nombre
  const navigation = useNavigation();

  useEffect(() => {
    fetchHotels(cityName);
    configureHeader();
  }, [cityName]);

  const fetchHotels = async (cityName) => {
    try {
      const existingHotels = await getHotelsByCityFromFirestore(cityName);
      if (existingHotels.length > 0) {
        setHotels(existingHotels);
        sortHotels(sortOrder, existingHotels);
      } else {
        const params = {
          name: cityName,
          featureCode: "HTL",
          username: "ferchis26",
        };
        const url = `http://api.geonames.org/searchJSON?${new URLSearchParams(
          params
        ).toString()}`;
        const response = await axios.get(url);
        const data = response.data;
        if (!data || !data.geonames || data.geonames.length === 0) {
          throw new Error(
            "No se encontraron hoteles en la ciudad especificada."
          );
        }

        const limitedData = data.geonames.slice(0, 5);

        const hotelsData = await Promise.all(
          limitedData.map(async (hotel) => {
            const imageUrl = await fetchHotelImage(hotel.name);
        
            // Generar un número aleatorio entre 1 y el número total de especificaciones disponibles
            const numSpecs = Math.floor(Math.random() * specifications.length) + 1;
            const selectedSpecs = generateRandomSpecifications(numSpecs);
        
            const hotelData = {
              id: hotel.geonameId,
              name: hotel.name,
              description: generateRandomDescription(),
              imageUrl,
              stars: Math.floor(Math.random() * 5) + 1,
              pricePerNight: (Math.random() * 200 + 50).toFixed(2),
              location: `${hotel.name}, ${hotel.countryName}`,
              availableRooms: {
                individual: Math.floor(Math.random() * (200 - 60 + 1)) + 60,
                shared: Math.floor(Math.random() * (170 - 40 + 1)) + 40,
              },
              specifications: selectedSpecs,
            };
        
            await saveHotelToFirestore(hotelData);
        
            return hotelData;
          })
        );
        
        function generateRandomSpecifications(numSpecs) {
          const randomSpecs = [];
          const availableSpecs = [...specifications]; // Copiar la lista de especificaciones disponibles
        
          // Escoger numSpecs especificaciones aleatorias
          for (let i = 0; i < numSpecs; i++) {
            const randomIndex = Math.floor(Math.random() * availableSpecs.length);
            const spec = availableSpecs[randomIndex];
            randomSpecs.push(spec);
            availableSpecs.splice(randomIndex, 1); // Eliminar la especificación seleccionada para no repetirla
          }
        
          return randomSpecs;
        }
        
        

        setHotels(hotelsData);
        sortHotels(sortOrder, hotelsData);
      }
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };
  const specifications = [
    { id: 1, name: 'Internet', icon:'wifi' },
    { id: 2, name: 'Restaurante',icon:'rest' },
    { id: 3, name: 'Lavandería', icon:'checkcircle' },
    { id: 4, name: 'Estacionamiento',icon:'car' },
  ];
  
  const fetchHotelImage = async (hotelName) => {
    try {
      const response = await axios.get(
        "https://api.unsplash.com/photos/random",
        {
          params: {
            query: `hotel`,
            orientation: "landscape",
            client_id: "ypGbeZFXaNXsiHP77Wk41gcerLfkxlBnsnDBi76vVws",
          },
        }
      );
      return response.data.urls.regular;
    } catch (error) {
      return "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR4CTQo_YrIea8Dfle4Jjh4Hf9aYTGxNePgCw&s";
    }
  };

  const saveHotelToFirestore = async (hotelData) => {
    try {
      const db = firebase.firestore();
      const existingHotel = await db
        .collection("hotelsPreference")
        .doc(hotelData.id.toString())
        .get();
      if (!existingHotel.exists) {
        await db
          .collection("hotelsPreference")
          .doc(hotelData.id.toString())
          .set(hotelData);
        console.log(`Hotel ${hotelData.name} guardado en Firestore`);
      } else {
        console.log(`Hotel ${hotelData.name} ya existe en Firestore`);
      }
    } catch (error) {
      console.error(
        `Error al guardar hotel ${hotelData.name} en Firestore:`,
        error
      );
    }
  };

  const getHotelsByCityFromFirestore = async (cityName) => {
    try {
      const db = firebase.firestore();
      const snapshot = await db.collection("hotelsPreference").get();
      const hotels = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        if (data.location.includes(cityName)) {
          hotels.push(data);
        }
      });
      return hotels;
    } catch (error) {
      console.error(
        `Error al obtener hoteles de la ciudad ${cityName} de Firestore:`,
        error
      );
      return [];
    }
  };

  const generateRandomDescription = () => {
    const descriptions = [
      "Un lugar ideal para tus vacaciones.",
      "Experimenta la comodidad y el lujo en su máxima expresión.",
      "Descubre la hospitalidad y el encanto de este hotel.",
      "Perfecto para escapadas románticas y familiares por igual.",
      "Disfruta de vistas impresionantes y servicios de primera clase.",
    ];
    const randomIndex = Math.floor(Math.random() * descriptions.length);
    return descriptions[randomIndex];
  };

  const handleReservePress = (hotel) => {
    navigation.navigate("Reservar", {
      hotel,
      rooms: rooms,
      startDate: startDate,
      endDate: endDate,
    });
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

  const sortHotels = (orderBy, order, hotelsToSort) => {
    let sorted = [...hotelsToSort];
    if (orderBy === "price") {
      sorted = sorted.sort((a, b) => {
        if (order === "asc") {
          return parseFloat(a.pricePerNight) - parseFloat(b.pricePerNight);
        } else {
          return parseFloat(b.pricePerNight) - parseFloat(a.pricePerNight);
        }
      });
    } else if (orderBy === "name") {
      sorted = sorted.sort((a, b) => {
        if (order === "asc") {
          return a.name.localeCompare(b.name); // Orden ascendente por nombre
        } else {
          return b.name.localeCompare(a.name); // Orden descendente por nombre
        }
      });
    }
    setSortedHotels(sorted);
  };
  

  const applyFilters = () => {
    if (activeFilter === "name") {
      sortHotels("name", sortByNameOrder, hotels);
    } else {
      sortHotels("price", sortOrder, hotels);
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

  return (
    <View style={{ flex: 1 }}>
      <Header />
      <View style={styles.searchDetailsContainer}>
        <View style={styles.searchInputContainer}>
          <TouchableOpacity
            onPress={() =>
              fetchHotels(capitalizeFirstLetter(searchHotelName))
            }
          >
            <Ionicons
              name="search-circle"
              size={24}
              style={styles.searchIcon}
              color="white"
            />
          </TouchableOpacity>
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar"
            onChangeText={(text) => setSearchHotelName(text)}
            value={searchHotelName}
            placeholderTextColor="white"
          />
        </View>
        <TouchableOpacity
          style={styles.filterButton}
          onPress={openFiltersModal}
        >
          <Text style={styles.filterButtonText}>
            Filtros
            <AntDesign name="filter" size={24} color="gray" />
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={sortedHotels.length > 0 ? sortedHotels : hotels}
        renderItem={({ item }) => (
          <View style={styles.itemContainer}>
            <Image source={{ uri: item.imageUrl }} style={styles.image} />
            <View style={styles.textContainer}>
              <Text numberOfLines={1} style={styles.hotelName}>
                {item.name}
              </Text>
              <Text>Estrellas: {"⭐".repeat(item.stars)}</Text>
              <Text>Precio por noche: ${item.pricePerNight}</Text>
              <Text>Ubicación: {item.location}</Text>
              <TouchableOpacity
                style={styles.reserveButton}
                onPress={() => handleReservePress(item)}
              >
                <Text style={styles.reserveButtonText}>Reservar</Text>
                <Entypo
                  name="arrow-with-circle-right"
                  size={18}
                  color="#FFFFFF"
                />
              </TouchableOpacity>
            </View>
          </View>
        )}
        keyExtractor={(item) => item.id.toString()}
      />

      <Modal
        animationType="slide"
        transparent={true}
        visible={showFiltersModal}
        onRequestClose={closeFiltersModal}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text style={styles.modalHeader}>Ordenar por:</Text>
            <TouchableOpacity
  style={styles.filterButton}
  onPress={() => {
    setActiveFilter("price");
    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
  }}
>
  <Text style={styles.filterButtonText}>
    Precio {sortOrder === "asc" ? "↓ Menor" : "↑ Mayor"}
  </Text>
</TouchableOpacity>

<TouchableOpacity
  style={styles.filterButton}
  onPress={() => {
    setActiveFilter("name");
    setSortByNameOrder(sortByNameOrder === "asc" ? "desc" : "asc");
  }}
>
  <Text style={styles.filterButtonText}>
    Nombre {sortByNameOrder === "asc" ? "↓ A-Z" : "↑ Z-A"}
  </Text>
</TouchableOpacity>


      
            <Pressable
              style={[styles.button, styles.buttonClose]}
              onPress={applyFilters}
            >
              <Text style={styles.textStyle}>Aplicar</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
    marginTop: 32,
  },
  itemContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    padding: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    width: "90%",
    alignSelf: "center",
  },
  image: {
    width: 100,
    height: 150,
    borderRadius: 10,
    borderWidth: 5,
    borderColor: "#6d9773",
  },
  textContainer: {
    flex: 1,
    marginLeft: 10,
  },
  hotelName: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 5,
    maxWidth: "80%",
  },
  reserveButton: {
    marginTop: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ffba00",
    paddingVertical: 5,
    paddingHorizontal: 20,
    borderRadius: 15,
    width: "100%",
  },
  reserveButtonText: {
    color: "#FFFFFF",
    marginRight: 10,
    fontSize: 16,
    fontWeight: "bold",
  },
  searchDetailsContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginBottom: 20,
    marginTop: 20,
  },
  filterButton: {
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 5,
    marginTop: 10,
  },
  filterButtonText: {
    color: "gray",
    fontWeight: "bold",
    fontSize: 16,
  },
  searchInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 25,
    paddingHorizontal: 10,
    width: "75%",
    backgroundColor: "#6D9773",
    marginRight: 10,
    marginTop: 5,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 16,
    color: "white",
  },
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 22,
  },
  modalView: {
    margin: 20,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 35,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalHeader: {
    marginBottom: 5,
    textAlign: "center",
    fontSize: 20,
    fontWeight: "bold",
  },
  button: {
    borderRadius: 20,
    padding: 10,
    elevation: 2,
  },
  buttonClose: {
    backgroundColor: "#0C3B2E",
    marginTop: 10,
  },
  textStyle: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
  },
});

export default ResultScreen;
