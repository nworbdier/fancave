import React from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import NavBar from "../components/navBar";

// The league icons as provided
const leagueIcons = {
  NCAAF: "american-football-outline",
  NCAAB: "basketball-outline",
  NFL: "american-football-outline",
  MLB: "baseball-outline",
  NHL: require("../assets/hockey-puck.png"), // Use require for hockey puck
  NBA: "basketball-outline",
  WNBA: "basketball-outline",
  MLS: "football-outline",
};

const sports = ["NCAAF", "NCAAB", "NFL", "MLB", "NHL", "NBA", "WNBA", "MLS"];

const SportSelector = () => {
  // Ensure we reverse a copy of the array to avoid mutating the original
  const reversedSports = [...sports].reverse();

  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.itemContainer}>
      {item === "NHL" ? (
        <Image source={leagueIcons[item]} style={styles.icon} />
      ) : (
        <Ionicons
          name={leagueIcons[item]}
          size={24}
          color="white"
          style={styles.icon}
        />
      )}
      <Text style={styles.itemText}>{item}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.page}>
      <SafeAreaView />
      <View style={styles.content}>
        <FlatList
          data={reversedSports} // Use the reversed copy of the array here
          renderItem={renderItem}
          keyExtractor={(item) => item}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          inverted={true} // This will make the list start from the bottom
        />
      </View>
      <NavBar />
    </View>
  );
};

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: "black",
    paddingHorizontal: 20,
  },
  content: {
    flex: 10.5,
    paddingBottom: 10,
  },
  header: {
    color: "white",
    fontSize: 24,
    fontWeight: "bold",
    marginVertical: 20,
    textAlign: "left",
  },
  itemContainer: {
    flexDirection: "row",
    padding: 15,
    alignItems: "center",
  },
  itemText: {
    color: "white",
    fontSize: 18,
    marginLeft: 10,
  },
  icon: {
    width: 24,
    height: 24,
  },
  separator: {
    height: 1,
    backgroundColor: "white",
    marginVertical: 5,
  },
});

export default SportSelector;
