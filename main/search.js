import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  ScrollView,
  SafeAreaView,
  Image, // Import the Image component
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";

const Search = () => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);

  const handleSearch = () => {
    // Simulate search logic, replace with your API or logic
    const mockResults = [
      { id: "1", name: "Result 1" },
      { id: "2", name: "Result 2" },
      { id: "3", name: "Result 3" },
    ];
    setResults(mockResults.filter((item) => item.name.includes(query)));
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "black" }}>
      <View style={styles.container}>
        <ScrollView>
          {/* Search Box */}
          <View style={styles.searchBoxContainer}>
            <TextInput
              style={styles.input}
              placeholder="Search..."
              placeholderTextColor="gray"
              value={query}
              onChangeText={setQuery}
            />
          </View>

          {/* Browse Leagues */}
          <Text style={styles.gridHeader}>Browse Leagues</Text>
          <View style={styles.grid}>
            {[
              { league: "NCAAF", icon: "american-football-outline" },
              { league: "NCAAB", icon: "basketball-outline" },
              { league: "NFL", icon: "american-football-outline" },
              { league: "MLB", icon: "baseball-outline" },
              {
                league: "NHL",
                icon: "hockey-puck", // Custom image for NHL
                isCustomIcon: true, // Flag for custom image
              },
              { league: "NBA", icon: "basketball-outline" },
              { league: "WNBA", icon: "basketball-outline" },
              { league: "MLS", icon: "football-outline" },
            ].map(({ league, icon, isCustomIcon }) => (
              <View key={league} style={styles.gridItem}>
                <TouchableOpacity style={styles.gridButton}>
                  {isCustomIcon ? (
                    <Image
                      source={require("../assets/hockey-puck.png")} // Load custom hockey puck image
                      style={{ width: 24, height: 24 }}
                    />
                  ) : (
                    <Ionicons name={icon} size={24} color="white" />
                  )}
                  <Text style={styles.gridButtonText}>{league}</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>

          {/* Browse by Sport */}
          <Text style={styles.gridHeader}>Browse by Sport</Text>
          <View style={styles.grid}>
            {[
              { sport: "Football", icon: "american-football-outline" },
              { sport: "Basketball", icon: "basketball-outline" },
              { sport: "Baseball", icon: "baseball-outline" },
              {
                sport: "Hockey",
                icon: "hockey-puck", // Custom image for hockey
                isCustomIcon: true, // Flag for custom image
              },
              { sport: "Soccer", icon: "football-outline" },
            ].map(({ sport, icon, isCustomIcon }) => (
              <View key={sport} style={styles.gridItem}>
                <TouchableOpacity style={styles.gridButton}>
                  {isCustomIcon ? (
                    <Image
                      source={require("../assets/hockey-puck.png")} // Load custom hockey puck image
                      style={{ width: 24, height: 24 }}
                    />
                  ) : (
                    <Ionicons name={icon} size={24} color="white" />
                  )}
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "black",
    padding: 20,
  },
  searchBoxContainer: {
    marginBottom: 20,
  },
  input: {
    height: 40,
    borderColor: "white",
    borderWidth: 1,
    borderRadius: 5,
    color: "white",
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  gridHeader: {
    fontSize: 20,
    color: "white",
    fontWeight: "bold",
    marginBottom: 20,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 15,
  },
  gridItem: {
    width: "48%",
    marginBottom: 10,
  },
  gridButton: {
    flexDirection: "row",
    justifyContent: "center",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    padding: 15,
    borderRadius: 5,
    alignItems: "center",
  },
  gridButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 10,
  },
});

export default Search;
