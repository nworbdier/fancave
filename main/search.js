import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  SafeAreaView,
  Image,
  ActivityIndicator,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
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

const Search = () => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  // Search after a 2-second pause of no typing
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (query) {
        handleSearch();
      } else {
        setResults([]); // Clear results if the query is empty
      }
    }, 500); // 2 seconds delay

    return () => clearTimeout(delayDebounceFn); // Cleanup timeout
  }, [query]);

  const handleSearch = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `https://fancave-api-production.up.railway.app/search?q=${query}`
      );
      const data = await response.json();
      // console.log(data);
      setResults(data.data || []); // Set results to data.data which contains the teams
    } catch (error) {
      console.error("Error fetching search results:", error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <SafeAreaView />
      <View style={styles.content}>
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

        {loading && <ActivityIndicator size="large" color="#fff" />}

        {/* Conditionally Render Results or Browse Sections */}
        {results.length > 0 ? (
          <FlatList
            data={results}
            renderItem={({ item }) => (
              <TouchableOpacity style={styles.listItem}>
                {item.league === "NHL" ? (
                  <Image
                    source={leagueIcons[item.league]}
                    style={{ width: 24, height: 24 }}
                  />
                ) : (
                  <Ionicons
                    name={leagueIcons[item.league]}
                    size={24}
                    color="white"
                  />
                )}
                <Text style={styles.listText}>{item.team}</Text>
              </TouchableOpacity>
            )}
          />
        ) : (
          <>
            {/* Browse Leagues */}
            <Text style={styles.gridHeader}>Browse Leagues</Text>
            <View style={styles.grid}>
              {Object.entries(leagueIcons).map(([league, icon]) => (
                <View key={league} style={styles.gridItem}>
                  <TouchableOpacity style={styles.gridButton}>
                    {league === "NHL" ? (
                      <Image
                        source={icon} // Use the require icon for NHL
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
                  icon: require("../assets/hockey-puck.png"), // Use require for hockey puck
                  isCustomIcon: true,
                },
                { sport: "Soccer", icon: "football-outline" },
              ].map(({ sport, icon, isCustomIcon }) => (
                <View key={sport} style={styles.gridItem}>
                  <TouchableOpacity style={styles.gridButton}>
                    {isCustomIcon ? (
                      <Image
                        source={icon} // Use the require icon for custom sports
                        style={{ width: 24, height: 24 }}
                      />
                    ) : (
                      <Ionicons name={icon} size={24} color="white" />
                    )}
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </>
        )}
      </View>
      <NavBar />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "black",
  },
  content: {
    flex: 10.5,
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
  listItem: {
    flexDirection: "row",
    justifyContent: "left",
    padding: 10,
    alignItems: "center",
  },
  listText: {
    color: "white",
    fontSize: 16,
    marginLeft: 15,
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
