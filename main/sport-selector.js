import React from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  StyleSheet,
  SafeAreaView,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";

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
  const renderItem = ({ item }) => (
    <View style={styles.itemContainer}>
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
    </View>
  );

  return (
    <View style={styles.container}>
      <SafeAreaView />
      <Text style={styles.header}>Select Sport</Text>
      <FlatList
        data={sports.reverse()} // Reverse the array to keep "NCAAF" as the first item
        renderItem={renderItem}
        keyExtractor={(item) => item}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        inverted={true} // This will make the list start from the bottom
      />
      <SafeAreaView />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "black",
    paddingHorizontal: 20,
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
    alignItems: "center",
    paddingVertical: 15,
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
