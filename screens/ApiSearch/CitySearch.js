import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, StyleSheet, Alert, Image, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';

const CitySearch = () => {
  const navigation = useNavigation();
  const [searchKeyword, setSearchKeyword] = useState('');
  const [imageURL, setImageURL] = useState(null);
  const [flightDestinations, setFlightDestinations] = useState([]);
  const [showMasInfo, setShowMasInfo] = useState(false);
  const [selectedFlight, setSelectedFlight] = useState(null);
  const [loading, setLoading] = useState(true);

  const handleCitySelect = (city) => {
    const { name } = city;
    navigation.navigate('Home', { selectedCity: { name } });
  };

  const handleCancelSelect = () => {
    setSelectedFlight(null);
    setShowMasInfo(false);
  };

  useEffect(() => {
    fetchCityImage();
  }, []);

  const defaultImageURL = 'https://www.deutschland.de/sites/default/files/styles/image_carousel_mobile/public/media/image/aufmacher_christina_varga_credit_leonardo_ai.jpg?itok=QzYcz0HF';

  const fetchCityImage = async () => {
    try {
      const response = await axios.get('https://api.unsplash.com/photos/random', {
        params: {
          query: 'city',
          orientation: 'landscape',
          client_id: 'ypGbeZFXaNXsiHP77Wk41gcerLfkxlBnsnDBi76vVws'
        }
      });
      const imageURL = response.data.urls.regular;
      setImageURL(imageURL);
    } catch (error) {
      setImageURL(defaultImageURL);
    } finally {
      setLoading(false);
    }
  };

  const fetchCityDestinations = async (keyword) => {
    try {
      const params = {
        name_startsWith: keyword,
        featureCode: 'PPL', // Código de característica para ciudades en GeoNames
        username: 'ferchis26' // Reemplaza con tu usuario de GeoNames
      };
      const url = `http://api.geonames.org/searchJSON?${new URLSearchParams(params).toString()}`;
      console.log('URL:', url); // Imprimir la URL antes de hacer la solicitud
      const response = await axios.get(url);
      const data = response.data;
      if (!data || !data.geonames || data.geonames.length === 0) {
        throw new Error('No se encontraron lugares para la palabra clave ingresada.');
      }
      // Eliminar duplicados
      const destinations = Array.from(new Set(data.geonames.map(place => place.name)))
        .map(name => {
          const place = data.geonames.find(p => p.name === name);
          return {
            name: place.name,
            country: place.countryName
          };
        });
      setFlightDestinations(destinations);
    } catch (error) {
      console.error('Error al buscar ciudades:', error);
      Alert.alert(
        "Resultado no encontrado",
        error.message,
        [{ text: "OK" }]
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    if (searchKeyword.trim() !== '') {
      setLoading(true); // Iniciar el indicador de carga
      fetchCityDestinations(searchKeyword);
    }
  };

  const handleFlightPress = (flight) => {
    setSelectedFlight(flight);
    setShowMasInfo(true);
  };

  const renderFlightItem = ({ item }) => (
    <TouchableOpacity key={item.name} onPress={() => handleFlightPress(item)} style={styles.itemContainer}>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Ionicons name="location-sharp" size={20} color="#0C3B2E" />
        <View style={{ marginLeft: 10 }}>
          <Text>{item.name}</Text>
          <Text>País: {item.country}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.headerText}>Ciudades</Text>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.input}
          placeholder="Escribe una palabra clave"
          value={searchKeyword}
          onChangeText={setSearchKeyword}
        />
        <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
          <Text style={styles.buttonText}>Buscar</Text>
        </TouchableOpacity>
      </View>
      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        showMasInfo ? (
          <View style={styles.detailsContainer}>
            <Text style={styles.cityName}>{selectedFlight.name}</Text>
            <Text>País: {selectedFlight.country}</Text>
            <View style={styles.imageContainer}>
              {imageURL && (
                <Image source={{ uri: imageURL, width: 200, height: 200 }} style={styles.image} />
              )}
            </View>
            <TouchableOpacity style={styles.selectButton} onPress={() => handleCitySelect(selectedFlight)}>
              <Text style={styles.buttonText}>Seleccionar ciudad</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelButton} onPress={handleCancelSelect}>
              <Text style={styles.buttonText}>
                <Ionicons name="return-down-back" size={24} color="black" />
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={flightDestinations}
            keyExtractor={(item, index) => `${item.name}_${index}`} // Utiliza index para asegurar claves únicas
            renderItem={renderFlightItem}
          />
        )
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 30,
    marginBottom: 40,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 40,
  },
  input: {
    flex: 1,
    marginRight: 10,
    borderWidth: 1,
    padding: 8,
  },
  searchButton: {
    backgroundColor: "#0C3B2E",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  detailsContainer: {
    alignItems: 'center',
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  cityName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  imageContainer: {
    marginVertical: 10,
  },
  image: {
    width: 200,
    height: 200,
    borderRadius: 10,
  },
  selectButton: {
    backgroundColor: "#0C3B2E",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginVertical: 10,
  },
  cancelButton: {
    marginLeft: 190,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  itemContainer: {
    backgroundColor: '#E0E0E0',
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
    width: '100%',
  },
});

export default CitySearch;
