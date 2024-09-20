import React from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { MaterialIcons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

const NavBar = () => {
  const navigation = useNavigation();

  return (
    <View style={styles.navBar}>
      <MaterialIcons name="home-filled" size={32} color="white" />
      <MaterialIcons name="search" size={32} color="white" />
      <MaterialCommunityIcons name="bell-outline" size={32} color="white" />
      <TouchableOpacity onPress={() => navigation.navigate("Account")}>
        <MaterialCommunityIcons name="account" size={32} color="white" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  navBar: {
    flex: 1,
    width: "100%",
    backgroundColor: "rgba(0, 0, 0, 0.7)", // Black color with 50% opacity
    flexDirection: "row",
    justifyContent: "space-around",
    paddingTop: 10,
  },
});

export default NavBar;
