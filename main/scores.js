import React, { useState } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import NavBar from "../components/navBar";

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

const Scores = () => {
  const [selectedSport, setSelectedSport] = useState(null);

  const handleSelectSport = (sport) => {
    setSelectedSport(sport);
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.itemContainer,
        selectedSport === item && styles.selectedItem,
      ]}
      onPress={() => handleSelectSport(item)}
    >
      {item === "NHL" ? (
        <Image source={leagueIcons[item]} style={styles.icon} />
      ) : (
        <Ionicons
          name={leagueIcons[item]}
          size={18}
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
      <View style={styles.sportCarousel}>
        <FlatList
          data={sports}
          renderItem={renderItem}
          keyExtractor={(item) => item}
          horizontal
          showsHorizontalScrollIndicator={false}
        />
      </View>

      {/* Placeholder content view for future score display */}
      <View style={styles.contentView}>
        {selectedSport ? (
          <Text style={styles.contentText}>
            Displaying scores for {selectedSport}
          </Text>
        ) : (
          <Text style={styles.contentText}>Select a sport to view scores</Text>
        )}
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
  sportCarousel: {
    flexShrink: 1, // Allows the button to shrink if needed
    flexGrow: 0, // Prevents the button from growing more than needed
    flexBasis: "auto", // Sets the button size based on its content
  },
  contentView: {
    flex: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  contentText: {
    color: "white",
    fontSize: 18,
  },
  itemContainer: {
    flexDirection: "row",
    padding: 10,
    alignItems: "center",
    backgroundColor: "black",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "white",
    marginHorizontal: 5,
  },

  selectedItem: {
    backgroundColor: "#333",
  },

  itemText: {
    color: "white",
    fontSize: 18,
    marginLeft: 10,
  },
  icon: {
    width: 18,
    height: 18,
  },
});

export default Scores;
