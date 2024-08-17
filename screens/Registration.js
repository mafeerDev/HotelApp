import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Image,
  ScrollView,
  Alert,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { firebase } from "../config";
import { Fontisto } from "@expo/vector-icons";
import { FontAwesome } from "@expo/vector-icons";
const Registration = () => {
  const navigation = useNavigation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  const registerUser = async () => {
    if (
      email.trim() === "" ||
      password.trim() === "" ||
      firstName.trim() === "" ||
      lastName.trim() === ""
    ) {
      alert("Todos los campos son obligatorios");
      return;
    }

    try {
      await firebase.auth().createUserWithEmailAndPassword(email, password);
      const currentUser = firebase.auth().currentUser;

      await currentUser.sendEmailVerification({
        handleCodeInApp: true,
        url: "https://book-f12a2.firebaseapp.com",
      });

      await firebase.firestore().collection("users").doc(currentUser.uid).set({
        firstName,
        lastName,
        email,
        
      });
      Alert.alert(
        "Verifique su correo electrónico",
        "Para autenticar su cuenta",
        [
          {
            text: "Aceptar",
          },
        ]
      );
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Image
        source={{ uri: "https://i.postimg.cc/d0WL3N8L/logo.png" }}
        style={styles.logo}
      />
      <View style={styles.formContainer}>
        <Text style={styles.title}>Registro</Text>
        <View style={styles.inputContainer}>
          <Fontisto
            name="person"
            size={24}
            color="#6D9773"
            style={styles.icon}
          />
          <TextInput
            style={styles.input}
            placeholder="Nombre"
            onChangeText={setFirstName}
            autoCorrect={false}
          />
        </View>
        <View style={styles.inputContainer}>
          <Fontisto
            name="person"
            size={24}
            color="#6D9773"
            style={styles.icon}
          />
          <TextInput
            style={styles.input}
            placeholder="Apellido"
            onChangeText={setLastName}
            autoCorrect={false}
          />
        </View>
        <View style={styles.inputContainer}>
          <Fontisto
            name="email"
            size={24}
            color="#6D9773"
            style={styles.icon}
          />
          <TextInput
            style={styles.input}
            placeholder="Email"
            onChangeText={setEmail}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
          />
        </View>
        <View style={styles.inputContainer}>
          <Fontisto name="key" size={24} color="#6D9773" style={styles.icon} />
          <TextInput
            style={styles.input}
            placeholder="Contraseña"
            onChangeText={setPassword}
            autoCapitalize="none"
            autoCorrect={false}
            secureTextEntry={true}
          />
        </View>
        <TouchableOpacity style={styles.button} onPress={registerUser}>
          <View style={styles.buttonContent}>
            <Text style={styles.buttonText}>Registrarse</Text>
            <FontAwesome
              name="sign-in"
              size={24}
              color="black"
              style={styles.iconText}
            />
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.registerLink}
          onPress={() => navigation.navigate("Login")}
        >
          <Text style={styles.registerText}>
            ¿Ya tienes una cuenta?{" "}
            <Text style={styles.registerTextHighlight}>Inicia sesión</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#0C3B2E",
    justifyContent: "center",
    alignItems: "center",
  },
  formContainer: {
    width: "100%",
    height: "70%",
    backgroundColor: "#fff",
    borderRadius: 50,
    padding: 20,
    paddingBottom: 100,
    shadowColor: "#888",
    shadowOffset: { width: -2, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 5,
    elevation: 5,
  },
  title: {
    fontSize: 36,
    fontWeight: "900",
    color: "black",
    textAlign: "center",
    marginTop: 20,
    marginBottom: 20, // Añadido marginBottom
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#C0C0C0",
    shadowColor: "#000",
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 1,
    marginHorizontal: 5,
    paddingHorizontal: 15,
    paddingVertical: 5,
    marginTop: 10,
  },
  input: {
    flex: 1,
    height: 50,
    fontSize: 16,
    paddingHorizontal: 10,
    color: "black",
  },
  icon: {
    marginRight: 10,
  },
  button: {
    height: 50,
    backgroundColor: "#FFBA00",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 5,
    marginTop: 40,
    marginBottom: 30,
    marginHorizontal: 20,
  },
  buttonText: {
    fontSize: 18,
    color: "black",
    fontWeight: "bold",
  },
  registerLink: {
    alignItems: "center",
  },
  registerText: {
    fontSize: 14,
    color: "#333",
  },
  registerTextHighlight: {
    color: "#333",
    fontWeight: "bold",
    textDecorationLine: "underline",
  },
  logo: {
    width: "82%",
    height: "12%",
    marginBottom: 50,
    marginTop: 100,
    resizeMode: "contain",
    alignSelf: "center",
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  buttonText: {
    fontSize: 18,
    color: "black",
    fontWeight: "bold",
    marginRight: 10, 
  },
  iconText: {
  },
});

export default Registration;
