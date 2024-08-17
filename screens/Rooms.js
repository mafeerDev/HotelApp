import React, { useState } from 'react';
import { Text, View, Pressable, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from "@react-navigation/native";

const Rooms = ({ onConfirm }) => {
    const [rooms, setRooms] = useState(1);
    const [adults, setAdults] = useState(1);
    const [children, setChildren] = useState(0);
  const navigation = useNavigation();

    const updateRooms = () => {
        const totalPersons = (adults + children) + 1;
        setRooms(totalPersons);
    };

    const updateRooms2 = () => {
        const totalPersons = rooms - 1;
        if (totalPersons < 0) {
            totalPersons = 0;
        }
        setRooms(totalPersons);
    };

    const handleSearch = () => {
        if (adults) {
            Alert.alert(
              "Confirmación",
              `¿Desea seleccionar ${adults} habitaciones de adulto y ${children} habitaciones de niño?`,
              [
                {
                  text: "No",
                  onPress: () => console.log("Selección cancelada"),
                  style: "cancel",
                },
                {
                  text: "Sí",
                  onPress: () => {
                    console.log("Adulto:", adults, "niño", children);
                    onConfirm(rooms, adults, children);
                    navigation.navigate('HomeScreen'); 
                  },
                },
              ]
            );
          } else {
            Alert.alert("Error", "Por favor seleccione un rango válido de fechas.");
          }
    };

    return (
        <View style={styles.container}>
            <View style={styles.content}>
                <View style={styles.input}>
                    <Ionicons name="person" size={24} color="#0C3B2E" />
                    <View style={styles.inputText}>
                        <Text>{`Habitaciones: ${rooms} | ${adults} adulto(s) | ${children} niño(s)`}</Text>
                    </View>
                </View>
                <View style={styles.controls}>
                    <View style={styles.control}>
                        <Text>Habitaciones</Text>
                        
                            <Text>{rooms}</Text>
                           
                    </View>
                    <View style={styles.control}>
                        <Text>Adultos</Text>
                        <View style={styles.buttonGroup}>
                            <Pressable  onPress={() => {
                                    if (adults === 1) {
                                        alert("No se pueden tener menos de 1 adulto.");
                                    } else {
                                        setAdults(adults - 1);
                                        updateRooms2();
                                    }
                                }}
 style={styles.button}>
                                <Text>-</Text>
                            </Pressable>
                            <Text>{adults}</Text>
                            <Pressable  onPress={() => {
                                    setAdults((c) => c + 1)
                                    updateRooms();
                                }} style={styles.button}>
                                <Text>+</Text>
                            </Pressable>
                        </View>
                    </View>
                    <View style={styles.control}>
                        <Text>Niños</Text>
                        <View style={styles.buttonGroup}>
                            <Pressable  onPress={() => {
                                if(children != 0){
                                    setChildren(Math.max(0, children - 1));
                                    updateRooms2();
                                }
                                }} style={styles.button}>
                                <Text>-</Text>
                            </Pressable>
                            <Text>{children}</Text>
                            <Pressable  onPress={() => {
                                
                                    setChildren((c) => c + 1)
                                    updateRooms();
                                
                                }} style={styles.button}>
                                <Text>+</Text>
                            </Pressable>
                        </View>
                    </View>
                </View>
                <Pressable onPress={handleSearch} style={styles.searchButton}>
                    <Ionicons name="bed" size={24} color="#FFBA00" />
                    <Text style={styles.searchButtonText}>Guardar</Text>
                </Pressable>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        flex: 1,
        margin: 20,
    },
    input: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#FFC72C',
        borderRadius: 6,
        padding: 10,
        marginBottom: 20,
    },
    inputText: {
        marginLeft: 10,
    },
    controls: {
        marginBottom: 20,
    },
    control: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    buttonGroup: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    button: {
        borderWidth: 1,
        borderColor: '#BEBEBE',
        borderRadius: 13,
        width: 26,
        height: 26,
        alignItems: 'center',
        justifyContent: 'center',
        marginHorizontal: 5,
    },
    searchButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#0C3B2E',
        borderRadius: 6,
        padding: 10,
    },
    searchButtonText: {
        color: 'white',
        marginLeft: 5,
    },
});

export default Rooms;
