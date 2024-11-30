import { View, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";

const SearchBox = ({ value, onChangeText }) => (
  <View style={styles.searchBoxContainer}>
    <TextInput
      style={styles.searchBox}
      placeholder="Search matchups..."
      placeholderTextColor="#999"
      value={value}
      onChangeText={onChangeText}
    />
    {value.length > 0 && ( // Show the clear button only if there is text
      <TouchableOpacity
        onPress={() => onChangeText("")}
        style={styles.clearButton}
      >
        <Ionicons name="close" size={20} color="white" />
      </TouchableOpacity>
    )}
  </View>
);

const styles = StyleSheet.create({
  searchBoxContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: "90%",
    position: "relative",
  },
  searchBox: {
    flex: 1,
    height: 40,
    color: "white",
    paddingHorizontal: 10,
    marginTop: 10,
    marginBottom: 5,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: "white",
  },
  clearButton: {
    position: "absolute",
    right: 10,
    padding: 5,
  },
});

export default SearchBox;
