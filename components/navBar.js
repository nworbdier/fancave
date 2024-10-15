import React from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { MaterialIcons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

const NavBar = ({ currentRoute }) => {
  const navigation = useNavigation();

  const getIconColor = (routeName) => {
    return currentRoute === routeName ? "dodgerblue" : "white";
  };

  return (
    <View style={styles.navBar}>
      <TouchableOpacity onPress={() => navigation.navigate("Feed")}>
        <MaterialIcons
          name="home-filled"
          size={32}
          color={getIconColor("Feed")}
        />
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate("Search")}>
        <MaterialIcons name="search" size={32} color={getIconColor("Search")} />
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate("Scores")}>
        <MaterialCommunityIcons
          name="scoreboard-outline"
          size={32}
          color={getIconColor("Scores")}
        />
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate("Settings")}>
        <MaterialCommunityIcons
          name="account"
          size={32}
          color={getIconColor("Settings")}
        />
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
