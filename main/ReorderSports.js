import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import DraggableFlatList, { ScaleDecorator } from "react-native-draggable-flatlist"; // Import ScaleDecorator
import { GestureHandlerRootView } from "react-native-gesture-handler";

const ReorderSports = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { sportsOrder: initialSportsOrder } = route.params;
  const [sportsOrder, setSportsOrder] = useState(initialSportsOrder);

  const renderItem = ({ item, drag, isActive }) => {
    return (
      <ScaleDecorator>
        <TouchableOpacity
          onLongPress={drag}
          disabled={isActive}
          style={[
            styles.sportItem,
            { backgroundColor: isActive ? "red" : "black" }, // Change color when active
          ]}
        >
          <Text style={styles.sportText}>{item.label}</Text>
        </TouchableOpacity>
      </ScaleDecorator>
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
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={styles.container}>
        <SafeAreaView />
        <Text style={styles.title}>Sports</Text>
        <DraggableFlatList
          data={sportsOrder}
          onDragEnd={({ data }) => setSportsOrder(data)}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
        />
        <TouchableOpacity style={styles.doneButton} onPress={saveSportsOrder}>
          <Text style={styles.doneButtonText}>Done</Text>
        </TouchableOpacity>
      </View>
    </GestureHandlerRootView>
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
    height: 100, // Set a height for the item
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "white",
    borderRadius: 10,
    marginVertical: 5,
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
