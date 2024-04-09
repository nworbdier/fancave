import React from "react";
import { View, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { MaterialIcons } from "@expo/vector-icons";

const NavBar = () => {
  return (
    <View style={styles.navBar}>
      <MaterialIcons name="home-filled" size={32} color="white" />
      <MaterialIcons name="home-filled" size={32} color="white" />
      <MaterialIcons name="home-filled" size={32} color="white" />
    </View>
  );
};

const styles = StyleSheet.create({
  navBar: {
    flex: 1,
    width: "100%",
    backgroundColor: "grey",
    flexDirection: "row",
    justifyContent: "space-evenly",
    paddingTop: 10,
  },
});

export default NavBar;
