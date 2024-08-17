import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, TextInput, StyleSheet, Image, SafeAreaView, Alert, ScrollView } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { firebase, storage } from '../config';
import * as ImagePicker from 'expo-image-picker';
import Dashboard from './Dashboard';
import { Fontisto } from '@expo/vector-icons'; // Importar el icono de Fontisto

const ProfileUser = () => {
    const navigation = useNavigation();
    const [email, setEmail] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [profileImage, setProfileImage] = useState(null);
    const [loading, setLoading] = useState(true);

    const defaultImageUrl = 'https://imgv3.fotor.com/images/blog-cover-image/10-profile-picture-ideas-to-make-you-stand-out.jpg';

    const loadData = async () => {
        const currentUser = firebase.auth().currentUser;
        if (currentUser) {
            try {
                const url = await firebase.storage().ref(`${currentUser.uid}/profileImage`).getDownloadURL();
                setProfileImage(url);

                const userData = await firebase.firestore().collection('users').doc(currentUser.uid).get();
                if (userData.exists) {
                    const userDataValues = userData.data();
                    setFirstName(userDataValues.firstName);
                    setLastName(userDataValues.lastName);
                    setEmail(currentUser.email);
                }
                setLoading(false);
            } catch (error) {
                Alert.alert(
                    "Añade una foto de perfil",
                    "Da click en aceptar",
                    [
                      {
                        text: "Aceptar",
                        onPress: () => addProfileImage(defaultImageUrl),
                      },
                    ]
                );
                setLoading(false);
            }
        }
    };

    const addProfileImage = async (url) => {
        const currentUser = firebase.auth().currentUser;
        if (currentUser) {
            try {
                const response = await fetch(url);
                const blob = await response.blob();
                const newImageName = `${currentUser.uid}/profileImage`;
                const newRef = storage.ref(newImageName);
                await newRef.put(blob);
                const newImageUrl = await newRef.getDownloadURL();
                setProfileImage(newImageUrl);
            } catch (error) {
                console.error('Error al subir la imagen:', error);
                Alert.alert('Error', 'Hubo un error al subir la imagen. Por favor, inténtalo de nuevo.');
            }
        }
    };

    useFocusEffect(
        React.useCallback(() => {
            loadData();
            return () => {};
        }, [])
    );

    useEffect(() => {
        loadData();
    }, []);

    const signOut = async () => {
        try {
            await firebase.auth().signOut();
            Alert.alert(
                'Sesión cerrada',
                'Has cerrado sesión exitosamente.',
                [{ text: 'OK'}]
            );
            setEmail('');
            setFirstName('');
            setLastName('');
            setProfileImage(null);
        } catch (error) {
            console.error('Error al cerrar sesión:', error);
            Alert.alert('Error', 'Hubo un error al cerrar sesión. Por favor, inténtalo de nuevo.');
        }
    };

    const changePassword = () => {
        const currentUser = firebase.auth().currentUser;
        if (currentUser) {
            firebase.auth()
                .sendPasswordResetEmail(currentUser.email)
                .then(() => {
                    Alert.alert('Revisa tu correo', 'Se ha enviado un correo para restablecer tu contraseña.');
                })
                .catch(error => {
                    Alert.alert('Error', 'No se pudo enviar el correo de restablecimiento de contraseña.');
                    console.error('Error al enviar el correo:', error);
                });
        } else {
            Alert.alert('Error', 'No se pudo enviar el correo de restablecimiento de contraseña.');
        }
    };

    const takePhoto = () => {
        console.log('Navigating to TakePhoto');
        navigation.navigate('Tomar');
    };

    const pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.All,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        });

        if (!result.cancelled) {
            try {
                const currentUser = firebase.auth().currentUser;
                if (currentUser) {
                    const response = await fetch(result.assets[0].uri);
                    const blob = await response.blob();
                    const newImageName = `${currentUser.uid}/profileImage`;
                    const newRef = storage.ref(newImageName);
                    await newRef.put(blob);
                    const newImageUrl = await newRef.getDownloadURL();
                    setProfileImage(newImageUrl);
                    Alert.alert('Imagen Subida', 'La imagen se ha subido correctamente.');
                }
            } catch (error) {
                console.error('Error al subir la imagen:', error);
                Alert.alert('Error', 'Hubo un error al subir la imagen. Por favor, inténtalo de nuevo.');
            }
        }
    };

    const updateProfile = async () => {
        const currentUser = firebase.auth().currentUser;
        if (currentUser) {
            try {
                await firebase.firestore().collection('users').doc(currentUser.uid).update({
                    firstName: firstName,
                    lastName: lastName,
                });
                Alert.alert('Perfil Actualizado', 'Tu información ha sido actualizada correctamente.');
            } catch (error) {
                console.error('Error al actualizar el perfil:', error);
                Alert.alert('Error', 'Hubo un error al actualizar tu perfil. Por favor, inténtalo de nuevo.');
            }
        } else {
            Alert.alert('Error', 'No se pudo actualizar el perfil. Usuario no autenticado.');
        }
    };

    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <Text>Cargando...</Text>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollViewContent}>
                <View style={styles.profileContainer}>
                <View style={styles.nameContainer}>
                        <Fontisto name="person" size={27} color="#ffba00" style={styles.icon} />
                        <TextInput
                            style={[styles.textInput, styles.centeredTextInput]}
                            value={`${firstName} ${lastName}`}
                            onChangeText={(text) => {
                                const parts = text.split(' ');
                                setFirstName(parts[0]);
                                setLastName(parts[1]);
                            }}
                            placeholder="Nombre Apellido"
                            placeholderTextColor="#FFF"
                        />
                    </View>

                    <TextInput
                        style={[styles.textInput, styles.emailInput]}
                        value={email}
                        placeholder="Correo electrónico"
                        editable={false}
                        placeholderTextColor="#FFF"
                    />
                    {profileImage && (
                        <Image source={{ uri: profileImage }} style={[styles.profileImage, { borderColor: '#6D9773', borderWidth: 8 }]} />
                    )}
                    <View style={styles.nameContainer}>
                        <TouchableOpacity onPress={takePhoto} style={styles.button2}>
                        <Fontisto name="camera" size={27} color="#ffba00" style={styles.icon2} />
                        </TouchableOpacity>
                       
                        <TouchableOpacity onPress={pickImage} style={styles.button2}>
                        <Fontisto name="photograph" size={27} color="#ffba00" style={styles.icon2} />
                        </TouchableOpacity>
                    </View>
                    
                </View>
                <View style={styles.formContainer}>
                    <TouchableOpacity onPress={changePassword} style={styles.button}>
                        <Text style={styles.buttonText}>Cambiar contraseña</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={updateProfile} style={styles.button}>
                        <Text style={styles.buttonText}>Guardar Cambios</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => signOut()} style={[styles.button, styles.logoutButton]}>
                        <Text style={styles.buttonText}>Cerrar Sesión</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0C3B2E',
    },
    scrollViewContent: {
        flexGrow: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 0,
    },
    profileContainer: {
        alignItems: 'center',
        marginTop: 10,
    },
    profileImage: {
        width: 150,
        height: 150,
        borderRadius: 100,
        marginBottom: 0,
    },
    nameContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 5,
    },
    centeredTextInput: {
        flex: 1,
        marginLeft: -110,
        fontSize: 23,
        color: '#FFF',
    },
    textInput: {
        borderBottomWidth: 1,
        borderBottomColor: 'transparent', // inferior
        fontSize: 22,
        textAlign: 'center',
        color: '#FFF',
        marginLeft: -10,
    },
    emailInput: {
        marginBottom: 40,
    },
    formContainer: {
        width: '100%',
        paddingHorizontal: 20,
        paddingVertical: 40,
        backgroundColor: '#FFF',
        borderTopLeftRadius: 50,
        borderTopRightRadius: 50,
        marginTop: 20,
        shadowColor: '#888',
        shadowOffset: { width: -2, height: 2 },
        shadowOpacity: 0.8,
        shadowRadius: 5,
        elevation: 5,
    },
    button: {
        backgroundColor: '#FFF',
        borderRadius: 15,
        borderWidth: 1,
        borderColor: '#CCC',
        paddingVertical: 15,
        paddingHorizontal: 20,
        marginBottom: 20,
        width: '100%',
        alignItems: 'center',
    },
    button2: {
        borderRadius: 15,
        paddingVertical: 15,
        width: '50%',
        alignItems: 'center',
    },
    logoutButton: {
        backgroundColor: '#FFBA00',
    },
    buttonText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#000',
    },
    icon: {
        marginRight: 0, 
        marginHorizontal:85,
    },
    
    icon2: {
        marginRight: 0, 
        marginHorizontal:0,
        marginHorizontal:10,

    },
});

export default ProfileUser;
