import React, { useState } from "react";
import { View, TouchableOpacity, StyleSheet, Text, Alert } from "react-native";
import { Calendar, LocaleConfig } from "react-native-calendars";
import { useNavigation } from "@react-navigation/native";

LocaleConfig.locales["es"] = {
  monthNames: [
    "Enero","Febrero","Marzo","Abril",
    "Mayo","Junio","Julio","Agosto",
    "Septiembre","Octubre","Noviembre",
    "Diciembre",
  ],
  monthNamesShort: [
    "Ene.","Feb.", "Mar.",
    "Abr.", "May.","Jun.",
    "Jul.","Ago.","Sep.",
    "Oct.", "Nov.","Dic.",
  ],
  dayNames: [
    "Domingo", "Lunes",
    "Martes", "Miércoles",
    "Jueves", "Viernes",
    "Sábado",
  ],
  dayNamesShort: ["Dom.", "Lun.", "Mar.", "Mié.", "Jue.", "Vie.", "Sáb."],
};

LocaleConfig.defaultLocale = "es";

const DateRangePickerComponent = ({ onConfirm }) => {
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const navigation = useNavigation();

  const onDayPress = (day) => {
    if (!startDate || endDate) {
      setStartDate(day.dateString);
      setEndDate(null);
    } else if (day.dateString < startDate) {
      setStartDate(day.dateString);
    } else {
      setEndDate(day.dateString);
    }
  };

  const handleSelectRange = () => {
    if (startDate && endDate) {
      Alert.alert(
        "Confirmación",
        `¿Desea seleccionar el rango de fechas del ${startDate} al ${endDate}?`,
        [
          {
            text: "No",
            onPress: () => console.log("Selección cancelada"),
            style: "cancel",
          },
          {
            text: "Sí",
            onPress: () => {
              console.log("Rango seleccionado:", startDate, "a", endDate);
              onConfirm(startDate, endDate);
              navigation.navigate('HomeScreen'); 
            },
          },
        ]
      );
    } else {
      Alert.alert("Error", "Por favor seleccione un rango válido de fechas.");
    }
  };

  const markedDates = {};

  if (startDate) {
    markedDates[startDate] = {
      startingDay: true,
      color: "#BB8A52",
      textColor: "white",
    };
  }

  if (endDate) {
    markedDates[endDate] = {
      endingDay: true,
      color: "#BB8A52",
      textColor: "white",
    };
  }

  if (startDate && endDate) {
    let currentDate = new Date(startDate);
    while (currentDate <= new Date(endDate)) {
      const dateString = currentDate.toISOString().split("T")[0];
      if (dateString === startDate || dateString === endDate) {
        markedDates[dateString] = {
          ...markedDates[dateString],
          color: "#BB8A52",
          textColor: "white",
        };
      } else {
        markedDates[dateString] = { color: "#FFBA00", textColor: "black" };
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }
  }

  console.log("markedDates:", markedDates);

  return (
    <View>
      <Text style={styles.title}>Elige un rango de fechas</Text>
      <Calendar
        current={new Date().toISOString().split("T")[0]}
        onDayPress={onDayPress}
        markedDates={markedDates}
        markingType={"period"}
      />
      <TouchableOpacity
        title="Seleccionar fecha"
        onPress={handleSelectRange}
        style={styles.boton}
      >
        <Text style={styles.botonText}>Seleccionar</Text>
      </TouchableOpacity>
    </View>
  );
};

export default DateRangePickerComponent;

const styles = StyleSheet.create({
  boton: {
    backgroundColor: "#0c3b2e",
    padding: 15,
    alignItems: "center",
    marginTop: 20,
    borderRadius: 10,
  },
  botonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
    letterSpacing: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    marginTop: 30,
    marginBottom: 30,
    color: "#333",
  },
});
