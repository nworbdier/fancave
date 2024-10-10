import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { sportsData } from "./scores";

const ReorderSports = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { sportsOrder: initialSportsOrder } = route.params;
  const [sportsOrder, setSportsOrder] = useState(initialSportsOrder);

  const renderSportItem = (sport, index) => {
    return (
      <View
        key={sportsData[sport].id}
        style={styles.sportItem} // Use normal View instead of Animated.View
      >
        <Text style={styles.sportText}>{sportsData[sport].name}</Text>
        <Ionicons name="menu" size={24} color="white" />
      </View>
    );
  };

  const saveSportsOrder = async () => {
    try {
      await AsyncStorage.setItem("sportsOrder", JSON.stringify(sportsOrder));
      navigation.navigate("Scores", { updatedSportsOrder: sportsOrder });
    } catch (error) {
      console.error("Error saving sports order:", error);
    }
  };

  return (
    <View style={styles.container}>
      <SafeAreaView />
      <Text style={styles.title}>Sports</Text>
      {sportsOrder.map(renderSportItem)}
      <TouchableOpacity style={styles.doneButton} onPress={saveSportsOrder}>
        <Text style={styles.doneButtonText}>Done</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "black",
    padding: 20,
  },
  title: {
    color: "white",
    fontSize: 24,
    marginTop: 15,
    marginBottom: 15,
    fontWeight: "bold",
  },
  sportItem: {
    flexDirection: "row",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: "white",
    borderRadius: 10,
    marginVertical: 5,
    justifyContent: "space-between",
    alignItems: "center",
  },
  sportText: {
    color: "white",
    fontSize: 18,
  },
  doneButton: {
    backgroundColor: "yellow",
    padding: 10,
    alignItems: "center",
    borderRadius: 5,
    marginTop: 20,
  },
  doneButtonText: {
    color: "black",
    fontWeight: "bold",
    fontSize: 18,
  },
});

export default ReorderSports;
