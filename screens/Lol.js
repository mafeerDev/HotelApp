import React, { useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const BookingScreen = () => {
  const navigation = useNavigation();
  const slideAnim = useRef(new Animated.Value(-200)).current;

  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 2000,
      useNativeDriver: true,
    }).start();
  }, [slideAnim]);

  const goToLogin = () => {
    navigation.navigate('Login');
  };

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.imageContainer, { transform: [{ translateX: slideAnim }] }]}>
        <Image 
          source={{uri:'https://i.postimg.cc/qR0C66F5/lol.png'}}
          style={styles.image} 
        />
      </Animated.View>
      
      <Animated.View style={[styles.textContainer, { transform: [{ translateX: slideAnim }] }]}>
        <Text style={styles.welcomeText}>Bienvenido a Booking</Text>
        <Text style={styles.subtitleText}>Reserva tu próximo vuelo, hotel o automóvil con nosotros</Text>
        <TouchableOpacity style={styles.button} onPress={goToLogin}>
          <Text style={styles.buttonText}>Comenzar</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

export default BookingScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0C3B2E',
  },
  imageContainer: {
    flex: 2, // Cambiado de flex: 2 a flex: 1
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0C3B2E',
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
  },
  subtitleText: {
    fontSize: 18,
    color: '#fff',
    textAlign: 'center',
    marginBottom: 20,
    marginHorizontal: 8,
  },
  button: {
    backgroundColor: '#6d9773',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  image: {
    flex: 1, // Ajustado para ocupar todo el espacio del contenedor
    width: '100%', // Anulando el ancho para que se ajuste automáticamente
    height: '100%', // Anulando el alto para que se ajuste automáticamente
    resizeMode: 'cover', // Ajusta la imagen para que cubra todo el contenedor
  },
});
