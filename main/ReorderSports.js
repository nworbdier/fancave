import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";
import DraggableFlatList from "react-native-draggable-flatlist";
import Ionicons from "@expo/vector-icons/Ionicons";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useSportsContext } from "./SportsContext";

const ReorderSports = () => {
  const navigation = useNavigation();
  const { sportsData, updateSportsOrder } = useSportsContext();
  const [sportsOrder, setSportsOrder] = useState([]);

  useEffect(() => {
    setSportsOrder(Object.values(sportsData));
  }, [sportsData]);

  const renderItem = ({ item, drag, isActive }) => {
    return (
      <TouchableOpacity
        onLongPress={drag}
        disabled={isActive}
        style={styles.rowItem}
      >
        <Text style={styles.text}>{item.name}</Text>
        <Ionicons name="menu" size={24} color="white" />
      </TouchableOpacity>
    );
  };

  const handleDonePress = () => {
    updateSportsOrder(sportsOrder);
    navigation.goBack();
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={styles.container}>
        <Text style={styles.title}>Reorder Sports</Text>
        <DraggableFlatList
          data={sportsOrder}
          onDragEnd={({ data }) => setSportsOrder(data)}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
        />
        <TouchableOpacity style={styles.doneButton} onPress={handleDonePress}>
          <Text style={styles.doneButtonText}>Done</Text>
        </TouchableOpacity>
      </View>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 20,
    padding: 20,
    backgroundColor: "black",
  },
  title: {
    color: "white",
    fontSize: 24,
    marginTop: 15,
    marginBottom: 15,
    fontWeight: "bold",
  },
  rowItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 10,
    borderWidth: 1,
    borderColor: "white",
    borderRadius: 5,
    marginVertical: 5,
    marginHorizontal: 10,
  },
  text: {
    color: "white",
    fontSize: 24,
    fontWeight: "bold",
  },
  doneButton: {
    backgroundColor: "yellow",
    padding: 10,
    marginHorizontal: 20,
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
