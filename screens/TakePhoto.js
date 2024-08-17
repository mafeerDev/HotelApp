import React, { useState, useRef, useEffect } from "react";
import {
  Button,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Alert,
} from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import * as MediaLibrary from "expo-media-library";
import { firebase, storage } from "../config";
import { useNavigation } from "@react-navigation/native";
import { Entypo } from "@expo/vector-icons";
import { FontAwesome6 } from "@expo/vector-icons";
import { MaterialIcons } from '@expo/vector-icons';
import { FontAwesome } from '@expo/vector-icons';

export default function TakePhoto() {
  const navigation = useNavigation();
  const [facing, setFacing] = useState("back");
  const [permission, requestPermission] = useCameraPermissions();
  const [capturedImage, setCapturedImage] = useState(null);
  const [isCameraVisible, setIsCameraVisible] = useState(true);
  const cameraRef = useRef(null);

  const discardImage = () => {
    setCapturedImage(null);
    setIsCameraVisible(true); // Mostrar la cámara nuevamente
  };

  useEffect(() => {
    (async () => {
      await requestPermission();
    })();
  }, []);

  if (!permission) {
    return <View />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={{ textAlign: "center" }}>
          Necesitamos los permisos de cámara
        </Text>
        <Button onPress={requestPermission} title="Dar permisos" />
      </View>
    );
  }

  const toggleCameraFacing = () => {
    setFacing((current) => (current === "back" ? "front" : "back"));
  };

  const takePicture = async () => {
    if (cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePictureAsync();
        console.log("Foto tomada:", photo.uri);
        setCapturedImage(photo.uri);
        setIsCameraVisible(false); // Ocultar la cámara después de capturar la imagen
        savePicture(photo.uri);
      } catch (error) {
        console.error("Fallo al tomar la foto:", error);
      }
    }
  };

  const savePicture = async (uri) => {
    try {
      const asset = await MediaLibrary.createAssetAsync(uri);
      console.log("Foto guardada en la galería:", asset);
    } catch (error) {
      console.error("Falló al guardar la imagen en galería:", error);
    }
  };

  const saveToFirebase = async () => {
    if (capturedImage) {
      try {
        const currentUser = firebase.auth().currentUser;
        if (currentUser) {
          const response = await fetch(capturedImage);
          const blob = await response.blob();
          const imageName = `${currentUser.uid}/profileImage`;
          const ref = storage.ref().child(imageName);
          await ref.put(blob);
          const downloadURL = await ref.getDownloadURL();

          await firebase
            .firestore()
            .collection("users")
            .doc(currentUser.uid)
            .update({
              profileImage: downloadURL,
            });

          Alert.alert("Éxito", "Foto subida", [
            {
              text: "Aceptar",
              onPress: () => {
                navigation.navigate("ProfileUser");
              },
            },
          ]);
        } else {
          Alert.alert("Error", "Usuario no autenticado");
        }
      } catch (error) {
        console.error("Error al enviar la imagen a Firebase:", error);
        Alert.alert("Error", "Error al subir la imagen");
      }
    } else {
      Alert.alert("Error", "Imagen no capturada");
    }
  };

  const again = () => {
    discardImage();
    console.log("Yendo a perfil usuario");
    navigation.navigate("ProfileUser");
  };

  return (
    <View style={styles.container}>
      {isCameraVisible && (
        <CameraView style={styles.camera} ref={cameraRef} facing={facing}>
          <View style={styles.blueContainer2}>
            <TouchableOpacity
              style={styles.button}
              onPress={toggleCameraFacing}
            >
              <Text style={styles.text}>
                <FontAwesome6 name="camera-rotate" size={24} color="white" />
              </Text>
            </TouchableOpacity>
          </View>
          <View style={styles.blueContainer}>
            <TouchableOpacity style={styles.button} onPress={takePicture}>
              <Text style={styles.text}>
                <Entypo name="camera" size={30} color="white" />
              </Text>
            </TouchableOpacity>
          </View>
        </CameraView>
      )}
      {capturedImage && (
        <View style={styles.previewContainer}>
          <Image source={{ uri: capturedImage }} style={styles.previewImage} />
          <View style={styles.blueContainer2}>
            <TouchableOpacity
              style={styles.discardButton}
              onPress={discardImage}
            >
              <Text style={styles.text}>
              <MaterialIcons name="cameraswitch" size={30} color="white" />
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.discardButton2} onPress={again}>
              <Text style={styles.text}>
              <FontAwesome name="close" size={30} color="red" />
              </Text>
            </TouchableOpacity>
          </View>
          <View style={styles.blueContainer}>
            <TouchableOpacity style={styles.button2} onPress={saveToFirebase}>
              <Text style={styles.text}>
              <MaterialIcons name="save-alt" size={30} color="white" />
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
  },
  camera: {
    flex: 1,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    position: "absolute",
    bottom: 20,
    width: "100%",
    paddingHorizontal: 20,
  },
  button: {
    alignItems: "center",
    borderRadius: 10,
    padding: 10,
  },
  button2: {
    alignItems: "center",
    borderRadius: 10,
    padding: 10,
  },
  blueContainer: {
    backgroundColor: "rgba(0,0,0,0.8)",
    justifyContent: "space-between",
    position: "absolute",
    bottom: 0,
    width: "100%",
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  blueContainer2: {
    backgroundColor: "rgba(0,0,0,0.8)",
    flexDirection: "row",
    justifyContent: "space-between",
    position: "absolute",
    top: 0,
    width: "100%",
    paddingHorizontal: 20,
    paddingVertical: 30,
  },
  text: {
    fontSize: 18,
    fontWeight: "bold",
    color: "white",
  },
  previewContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  previewImage: {
    width: "100%",
    height: "100%",
    borderRadius: 10,
  },
  actionContainer: {
    position: "absolute",
    bottom: 20,
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    paddingHorizontal: 20,
  },
  discardButton: {
    padding: 10,
    borderRadius: 5,
  },
  discardButton2: {
    padding: 10,
    borderRadius: 5,
  },
  discardText: {
    color: "white",
    fontWeight: "bold",
  },
  content2: {},
});
