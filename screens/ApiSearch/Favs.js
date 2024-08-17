import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { firebase } from '../../config';
import { Entypo } from '@expo/vector-icons';
import { useNavigation } from "@react-navigation/native";

const Favs = () => {
  const [favorites, setFavorites] = useState([]);
  const [favoriteAirports, setFavoriteAirports] = useState([]);
  const navigation = useNavigation();

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

    fetchFavorites();
  }, []);

  const fetchFavorites = async () => {
    try {
      const db = firebase.firestore();
      const uid = firebase.auth().currentUser.uid;
      const favoritesRef = db.collection('favorites').doc(uid);
      const doc = await favoritesRef.get();
      if (doc.exists) {
        setFavorites(doc.data().favorites);
        fetchFavoriteAirports(doc.data().favorites);
      } else {
        console.log('No hay datos de favoritos para este usuario.');
      }
    } catch (error) {
      console.error('Error al obtener favoritos:', error);
    }
  };

  const fetchFavoriteAirports = async (favoriteIds) => {
    try {
      const db = firebase.firestore();
      const favoriteAirports = [];

      await Promise.all(
        favoriteIds.map(async (id) => {
          const doc = await db.collection('airportsPreference').doc(id.toString()).get();
          if (doc.exists) {
            favoriteAirports.push(doc.data());
          }
        })
      );

      setFavoriteAirports(favoriteAirports);
    } catch (error) {
      console.error('Error al obtener aeropuertos favoritos:', error);
    }
  };

  const renderItem = ({ item }) => {
    return (
      <View style={styles.itemContainer}>
        <Image source={{ uri: item.imageUrl }} style={styles.itemImage} />
        <View style={styles.itemTextContainer}>
          <Text style={styles.itemTitle}>{item.name}</Text>
          <Text style={styles.itemSubtitle}>{item.description}</Text>
          <Text style={styles.itemLocation}>{item.location}</Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
             <Text style={styles.title}>Aeropuertos Favoritos</Text>
      <FlatList
        data={favoriteAirports}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        style={styles.list}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  list: {
    flex: 1,
  },
  itemContainer: {
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 10,
    margin: 10,
    flexDirection: 'row',
    alignItems: 'center',
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
    fontWeight: 'bold',
  },
  itemSubtitle: {
    fontSize: 14,
    color: 'gray',
  },
  itemLocation: {
    fontSize: 14,
    color: 'gray',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
});

export default Favs;
