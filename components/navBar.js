import React from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { MaterialIcons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

const NavBar = () => {
  const navigation = useNavigation();

  return (
    <View style={styles.navBar}>
      <TouchableOpacity onPress={() => navigation.navigate("Home")}>
        <MaterialIcons name="home-filled" size={32} color="white" />
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate("Search")}>
        <MaterialIcons name="search" size={32} color="white" />
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate("Scores")}>
        <MaterialCommunityIcons
          name="scoreboard-outline"
          size={32}
          color="white"
        />
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate("Settings")}>
        <MaterialCommunityIcons name="account" size={32} color="white" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  navBar: {
    flex: 1,
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-around",
    paddingTop: 10,
  },
});

export default NavBar;
