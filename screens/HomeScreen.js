import { useNavigation, useRoute } from "@react-navigation/native";
import React, { useLayoutEffect, useState } from "react";
import { Text,StyleSheet,View,ScrollView,Pressable,TextInput,Modal,BottomModal, ModalFooter, ModalButton, ModalTitle, SlideAnimation,ModalContent} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import DateRangePickerComponent from "./DateRangePickerComponent";
import Rooms from "./Rooms";
import Header from "../components/Header";
import ResultScreen from "./ApiSearch/ResultScreen";
import CitySearch from "./ApiSearch/CitySearch";
import { Entypo } from '@expo/vector-icons';
const HomeScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const [roomsOpen, setRoomsOpen] = useState(false);
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [selectedDates, setSelectedDates] = useState({ startDate: null, endDate: null });
  const [selectedRooms, setSelectedRooms] = useState({ rooms: 0, adults: 0 , children: 0 });

  const selectedCity = route.params?.selectedCity || {
    name: "Ciudad no seleccionada",
  };

  const handleSearch = () => {
    navigation.navigate("ResultScreen", {
      rooms: selectedRooms.rooms,
      startDate: selectedDates.startDate,
      endDate: selectedDates.endDate,
      cityName: selectedCity.name,
    });
  };
  const handleSearch2 = () => {
    try {
      navigation.navigate("CitySearch");
    } catch (error) {
      console.error("Error navigating to CitySearch:", error);
      // Display an error message to the user
      alert("Error: Unable to navigate to CitySearch");
    }
  };
  

  useLayoutEffect(() => {
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
  }, [navigation]);

  const handleDateConfirm = (startDate, endDate) => {
    setSelectedDates({ startDate, endDate });
    setIsPickerOpen(false);
  };

  const handleRoomsConfirm = (rooms, adults, children) => {
    setSelectedRooms({ rooms, adults, children });
    setRoomsOpen(false);
  };

  return (
    <>
      <View>
        <ScrollView>
            <Header/>
          <View style={{ margin: 20 }}>
            <Pressable
              onPress={handleSearch2}
              style={styles.pressableStyle}
            >
              <Ionicons name="location-sharp" size={24} color="#0C3B2E" />
              {selectedCity ? (
                <Text>{selectedCity.name}</Text>
              ) : (
                <TextInput
                  placeholderTextColor="black"
                  placeholder="Ingresa tu destino"
                />
              )}
            </Pressable>
            <Pressable
              style={styles.pressableStyle}
              onPress={() => setIsPickerOpen(true)}
            >
              <Ionicons name="calendar" size={24} color="#0C3B2E" />
              <Text>
                {selectedDates.startDate && selectedDates.endDate
                  ? `Fechas: ${selectedDates.startDate} - ${selectedDates.endDate}`
                  : "Seleccionar Fechas"}
              </Text>
            </Pressable>


            <Pressable
              onPress={() => setRoomsOpen(true)}
              style={styles.pressableStyle}
            >
              <Ionicons name="person" size={24} color="#0C3B2E" />
              <TextInput
                placeholderTextColor="black"
                placeholder={`Habitaciones: ${selectedRooms.rooms} | ${selectedRooms.adults} adultos | ${selectedRooms.children} niños`}
                editable={false}
             />
            </Pressable>



            <Pressable onPress={handleSearch} style={styles.searchButton}>
              <Ionicons name="search" size={24} color="#FFBA00" />
              <Text style={styles.searchText}>Buscar</Text>
            </Pressable>
            <Text style={styles.favoritesTitle}>!Conocenos!</Text>
            <ScrollView horizontal showsVerticalScrollIndicator={false}>
              {[
                "Viajes economicos",
                "Estancia de elementos culturales",
                "Aeropuertos cerca",
              ].map((hotel, index) => (
                <Pressable key={index} style={styles.recommendPress}>
                  <Text style={styles.recommendText}>{hotel}</Text>
                  <Text style={styles.recommendText2}>
                   ¡Se parte de esta experiencia!
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
            <Modal
              transparent={true}
              visible={isPickerOpen}
              onRequestClose={() => setIsPickerOpen(false)}
            >
              <View style={styles.modalBackground}>
                <View style={styles.modalContainer}>
                  <DateRangePickerComponent
                    onConfirm={handleDateConfirm}
                  />
                </View>
              </View>
            </Modal>

            <Modal
              transparent={true}
              visible={roomsOpen}
              onRequestClose={() => setRoomsOpen(false)}
            >
              <View style={styles.modalBackground2}>
                <View style={styles.modalContainer2}>
                  <Rooms
                    onConfirm={handleRoomsConfirm}
                  />
                </View>
              </View>
            </Modal>

            


            
          </View>
        </ScrollView>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  pressableStyle: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 10,
    borderColor: "#FFC72C",
    borderWidth: 2,
    paddingVertical: 20,
    borderRadius: 6,
    padding: 5,
    marginBottom: 5,
  },
  searchButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 100,
    borderColor: "#0C3B2E",
    borderWidth: 2,
    paddingVertical: 20,
    marginTop: 20,
    marginBottom: 5,
    borderRadius: 6,
    padding: 5,
    backgroundColor: "#0C3B2E",
  },
  searchText: {
    textAlign: "center",
    fontSize: 15,
    fontWeight: "500",
    color: "white",
  },
  favoritesTitle: {
    marginHorizontal: 20,
    marginLeft: 10,
    marginTop: 15,
    fontSize: 20,
    fontWeight: "500",
  },
  recommendPress: {
    width: 200,
    height: 150,
    backgroundColor: "#0C3B2E",
    marginTop: 10,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    padding: 20,
    marginHorizontal: 10,
  },
  recommendText: {
    color: "white",
    fontSize: 15,
    fontWeight: "bold",
    marginVertical: 7,
  },
  recommendText2: {
    color: "white",
    fontSize: 15,
    fontWeight: "500",
  },
  modalBackground: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContainer: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
  },
  modalBackground2: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContainer2: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
    marginTop:480,
  },
});

export default HomeScreen;
