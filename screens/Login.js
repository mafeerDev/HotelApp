import React, { useState } from "react";
import {View,Text,TouchableOpacity,TextInput,StyleSheet,Image,} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Fontisto } from "@expo/vector-icons";
import { FontAwesome } from "@expo/vector-icons";
import { firebase } from "../config";

const Login = () => {
  const navigation = useNavigation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const loginUser = async (email, password) => {
    try {
      await firebase.auth().signInWithEmailAndPassword(email, password);
     //navigation.navigate("ProfileUser");
    } catch (error) {
      alert(error.message);
    }
  };

  const forgetPassword = () => {
    firebase.auth().sendPasswordResetEmail(email).then(() => {
        alert("Se ha enviado un correo para restablecer la contraseña");
      })
      .catch((error) => {
        alert(error);
      });
  };

  return (
    <View style={styles.container}>
      <Image 
      source={{uri:'https://i.postimg.cc/d0WL3N8L/logo.png'}} 
      style={styles.logo} />
      <View style={styles.formContainer}>
        <Text style={styles.title}>Iniciar Sesión</Text>
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
            onChangeText={(email) => setEmail(email)}
            autoCapitalize="none"
            autoCorrect={false}
            placeholderTextColor="#C0C0C0"
          />
        </View>
        <View style={styles.inputContainer}>
          <Fontisto name="key" size={24} color="#6D9773" style={styles.icon} />
          <TextInput
            style={styles.input}
            placeholder="Password"
            onChangeText={(password) => setPassword(password)}
            autoCapitalize="none"
            autoCorrect={false}
            secureTextEntry={true}
            placeholderTextColor="#C0C0C0"
          />
        </View>
        <TouchableOpacity
          style={styles.button}
          onPress={() => loginUser(email, password)}
        >
          <View style={styles.buttonContent}>
            <Text style={styles.buttonText}>Entrar</Text>
            <FontAwesome
              name="sign-in"
              size={24}
              color="black"
              style={styles.iconText}
            />
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.forgotPasswordLink}
          onPress={() => forgetPassword()}
        >
          <Text style={styles.forgotPasswordText}>
            ¿Olvidaste tu contraseña?
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.registerLink}
          onPress={() => navigation.navigate("Registration")}
        >
          <Text style={styles.registerText}>
            ¿No tienes cuenta?{" "}
            <Text style={styles.registerTextHighlight}>Registrate</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default Login;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0C3B2E",
    justifyContent: "flex-start",
    alignItems: "center",
  },
  formContainer: {
    width: "100%",
    height: "70%",
    backgroundColor: "#fff",
    borderRadius: 50,
    padding: 20,
    position: "absolute",
    bottom: 0,
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
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 40,
    borderBottomWidth: 1,
    borderBottomColor: "#C0C0C0",
    shadowColor: "#000",
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 1,
    marginHorizontal: 5,
    paddingHorizontal: 15,
    paddingVertical: 5,
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
    marginHorizontal: 15,
    backgroundColor: "#FFBA00",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 5,
    marginTop: 60,
    marginBottom: 50,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
  },
  buttonText: {
    fontSize: 18,
    color: "black",
    fontWeight: "bold",
  },
  forgotPasswordLink: {
    marginBottom: 20,
    alignItems: "center",
  },
  forgotPasswordText: {
    fontSize: 14,
    color: "#333",
    textDecorationLine: "underline",
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
    marginBottom: 20,
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
});
