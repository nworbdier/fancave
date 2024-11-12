import React, { useState, useEffect } from "react";
import { StyleSheet, View, Text, TouchableOpacity } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";

const ThemeSettings = () => {
  const [selectedMode, setSelectedMode] = useState("auto"); // Default mode
  const [selectedColor, setSelectedColor] = useState("yellow"); // Default color

  // Load saved theme and color from AsyncStorage when component mounts
  useEffect(() => {
    const loadTheme = async () => {
      const savedTheme = await AsyncStorage.getItem("theme");
      const savedColor = await AsyncStorage.getItem("color");
      if (savedTheme) {
        setSelectedMode(savedTheme);
      }
      if (savedColor) {
        setSelectedColor(savedColor);
      }
    };
    loadTheme();
  }, []);

  // Function to handle mode selection
  const handleModeSelection = async (mode) => {
    setSelectedMode(mode);
    await AsyncStorage.setItem("theme", mode); // Save mode to AsyncStorage
  };

  // Function to handle color selection
  const handleColorSelection = async (color) => {
    setSelectedColor(color);
    await AsyncStorage.setItem("color", color); // Save color to AsyncStorage
  };

  return (
    <View style={styles.container}>
      <View>
        <Text style={styles.headerText}>Theme</Text>
      </View>

      {/* Manage Mode */}
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionHeader}>Mode</Text>

        <TouchableOpacity
          style={styles.option}
          onPress={() => handleModeSelection("dark")}
        >
          <Text style={styles.optionText1}>Dark</Text>
          <MaterialIcons
            name={
              selectedMode === "dark" ? "check-circle" : "check-circle-outline"
            }
            size={24}
            color={selectedMode === "dark" ? "yellow" : "white"}
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.option}
          onPress={() => handleModeSelection("light")}
        >
          <Text style={styles.optionText1}>Light</Text>
          <MaterialIcons
            name={
              selectedMode === "light" ? "check-circle" : "check-circle-outline"
            }
            size={24}
            color={selectedMode === "light" ? "yellow" : "white"}
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.option}
          onPress={() => handleModeSelection("grey")}
        >
          <Text style={styles.optionText1}>Grey</Text>
          <MaterialIcons
            name={
              selectedMode === "grey" ? "check-circle" : "check-circle-outline"
            }
            size={24}
            color={selectedMode === "grey" ? "yellow" : "white"}
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.option}
          onPress={() => handleModeSelection("auto")}
        >
          <Text style={styles.optionText1}>Auto</Text>
          <MaterialIcons
            name={
              selectedMode === "auto" ? "check-circle" : "check-circle-outline"
            }
            size={24}
            color={selectedMode === "auto" ? "yellow" : "white"}
          />
        </TouchableOpacity>
      </View>

      {/* Manage Color */}
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionHeader}>Color</Text>

        {/* New Color Options */}
        {["red", "orange", "yellow", "blue", "green", "purple", "pink"].map(
          (color) => (
            <TouchableOpacity
              key={color}
              style={styles.option}
              onPress={() => handleColorSelection(color)}
            >
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <View
                  style={[styles.colorCircle, { backgroundColor: color }]}
                />
                <Text style={styles.optionText2}>
                  {color.charAt(0).toUpperCase() + color.slice(1)}
                </Text>
              </View>
              <MaterialIcons
                name={
                  selectedColor === color
                    ? "check-circle"
                    : "check-circle-outline"
                }
                size={24}
                color={selectedColor === color ? "yellow" : "white"}
              />
            </TouchableOpacity>
          )
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
    backgroundColor: "black",
  },
  headerText: {
    fontSize: 30,
    color: "white",
    fontWeight: "bold",
    marginBottom: 15,
  },
  sectionContainer: {
    marginVertical: 15,
  },
  sectionHeader: {
    fontSize: 20,
    color: "grey",
    marginBottom: 15,
    fontWeight: "bold",
  },
  option: {
    paddingVertical: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginHorizontal: 10,
  },
  optionText1: {
    fontSize: 18,
    color: "white",
    fontWeight: "bold",
  },
  optionText2: {
    fontWeight: "bold",
    fontSize: 18,
    color: "white",
    marginLeft: 15,
    fontWeight: "bold",
  },
  colorCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
});

export default ThemeSettings;
