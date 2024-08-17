import React, { useState, useEffect } from 'react';
import { SafeAreaView, Text, StyleSheet } from 'react-native';
import { firebase } from '../config';
import ImagePickerExample from './Image';
import { useNavigation } from '@react-navigation/native';

const Dashboard = () => {
    const navigation = useNavigation();
    const [name, setName] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const user = firebase.auth().currentUser;
        if (user) {
            firebase.firestore().collection('users').doc(user.uid).get()
                .then((snapshot) => {
                    if (snapshot.exists) {
                        setName(snapshot.data().name);
                    } else {
                        console.log('Usuario no existe');
                    }
                    setLoading(false);
                }).catch((error) => {
                    console.error('Error obteniendo datos del usuario:', error);
                    setLoading(false);
                });
        } else {
            console.log('Usuario no autenticado');
            setLoading(false);
        }
    }, []);

    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <Text>Cargando...</Text>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <ImagePickerExample />
        </SafeAreaView>
    );
}

export default Dashboard;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
    },
});
