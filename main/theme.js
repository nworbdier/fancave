import React, { useState, useEffect } from "react";
import { StyleSheet, View, Text, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";

const Theme = () => {
  const [selectedTheme, setSelectedTheme] = useState("auto"); // Default theme is null (no selection)

  // Load saved theme from AsyncStorage when component mounts
  useEffect(() => {
    const loadTheme = async () => {
      const savedTheme = await AsyncStorage.getItem("theme");
      if (savedTheme) {
        setSelectedTheme(savedTheme);
      }
    };
    loadTheme();
  }, []);

  // Function to handle theme selection
  const handleThemeSelection = async (theme) => {
    setSelectedTheme(theme);
    await AsyncStorage.setItem("theme", theme); // Save theme to AsyncStorage
  };

  return (
    <View style={styles.container}>
      <SafeAreaView />
      <View>
        <Text style={styles.headerText}>Theme</Text>
      </View>

      {/* Manage Theme */}
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionHeader}>Mode</Text>

        <TouchableOpacity
          style={styles.option}
          onPress={() => handleThemeSelection("dark")}
        >
          <Text style={styles.optionText2}>Dark</Text>
          <MaterialIcons
            name={
              selectedTheme === "dark" ? "check-circle" : "check-circle-outline"
            }
            size={24}
            color={selectedTheme === "dark" ? "yellow" : "white"}
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.option}
          onPress={() => handleThemeSelection("light")}
        >
          <Text style={styles.optionText2}>Light</Text>
          <MaterialIcons
            name={
              selectedTheme === "light"
                ? "check-circle"
                : "check-circle-outline"
            }
            size={24}
            color={selectedTheme === "light" ? "yellow" : "white"}
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.option}
          onPress={() => handleThemeSelection("auto")}
        >
          <Text style={styles.optionText2}>Auto</Text>
          <MaterialIcons
            name={
              selectedTheme === "auto" ? "check-circle" : "check-circle-outline"
            }
            size={24}
            color={selectedTheme === "auto" ? "yellow" : "white"}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "black",
    paddingHorizontal: 20,
  },
  headerText: {
    fontSize: 30,
    color: "white",
    fontWeight: "bold",
    marginVertical: 20,
  },
  sectionContainer: {
    marginVertical: 15,
  },
  sectionHeader: {
    fontSize: 20,
    color: "lightgray",
    marginBottom: 15,
    fontWeight: "bold",
  },
  option: {
    paddingVertical: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginHorizontal: 15,
  },
  optionText2: {
    fontSize: 18,
    color: "white",
    fontWeight: "regular",
  },
});

export default Theme;
