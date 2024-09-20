import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
} from "react-native";

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
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Search</Text>
      </View>
      <View style={styles.content}>
        <TextInput
          style={styles.input}
          placeholder="Search..."
          placeholderTextColor="gray"
          value={query}
          onChangeText={setQuery}
        />
        <TouchableOpacity style={styles.button} onPress={handleSearch}>
          <Text style={styles.buttonText}>Search</Text>
        </TouchableOpacity>
        <FlatList
          data={results}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.resultItem}>
              <Text style={styles.text}>{item.name}</Text>
            </View>
          )}
          ListEmptyComponent={<Text style={styles.text}>No results found</Text>}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "black",
  },
  header: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)", // Black with opacity
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    flex: 3,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    padding: 20,
  },
  headerText: {
    fontSize: 30,
    color: "white",
    fontWeight: "bold",
  },
  input: {
    height: 40,
    borderColor: "white",
    borderWidth: 1,
    borderRadius: 5,
    color: "white",
    paddingHorizontal: 10,
    marginBottom: 20,
  },
  button: {
    backgroundColor: "blue",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
    marginBottom: 20,
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
  },
  resultItem: {
    padding: 10,
    borderBottomColor: "gray",
    borderBottomWidth: 1,
  },
  text: {
    color: "white",
    fontSize: 18,
  },
});

export default Search;
