import React, { useState } from "react";
import {
  StyleSheet,
  View,
  TextInput,
  TouchableOpacity,
  Text,
} from "react-native";

const Feedback = () => {
  const [message, setMessage] = useState("");

  const handleSubmit = () => {
    // Handle the submission logic here
    console.log("Feedback submitted:", message);
    setMessage(""); // Clear the input after submission
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Feedback</Text>
      <TextInput
        style={styles.input}
        placeholder="Please enter your feedback here..."
        placeholderTextColor="white"
        value={message}
        onChangeText={setMessage}
      />
      <TouchableOpacity style={styles.button} onPress={handleSubmit}>
        <Text style={styles.buttonText}>Submit</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "black",
  },
  title: {
    fontSize: 30,
    color: "white",
    fontWeight: "bold",
    marginBottom: 20,
  },
  input: {
    height: 125,
    borderColor: "gray",
    borderWidth: 1,
    marginBottom: 20,
    paddingHorizontal: 10,
    borderRadius: 5,
    color: "white",
  },
  button: {
    backgroundColor: "blue", // Change to your desired color
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default Feedback;
