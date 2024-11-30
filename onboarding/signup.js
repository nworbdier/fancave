import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Image,
  TouchableOpacity,
} from "react-native";
import { FIREBASE_AUTH } from "../firebaseConfig";
import { useNavigation, useRoute } from "@react-navigation/native";
import { FontAwesome5 } from "@expo/vector-icons"; // Import FontAwesome5 for icons
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import axios from "axios"; // Import Axios

const SignUp = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState(""); // Add state for username
  const auth = FIREBASE_AUTH;

  const navigation = useNavigation();

  const signUp = async () => {
    if (password !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    setLoading(true);
    try {
      const response = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const uuid = response.user.uid; // Get the user ID from Firebase

      // Send user data to the backend
      await axios.post("https://fancave-api.up.railway.app/post-users", {
        uuid,
        email,
        firstName,
        lastName,
        username, // Ensure username is included
      });

      alert("You have successfully created an account!");
      navigation.navigate("Welcome"); // Navigate to the next page after successful signup
    } catch (error) {
      let errorMessage = "An error occurred. Please try again.";

      if (error.response && error.response.data.error) {
        errorMessage = error.response.data.error; // Use the error message from the API
      }

      switch (error.code) {
        case "auth/email-already-in-use":
          errorMessage = "Email address is already in use.";
          break;
        case "auth/invalid-email":
          errorMessage = "Please enter a valid email address.";
          break;
        case "auth/user-disabled":
          errorMessage = "This account has been disabled.";
          break;
        case "auth/user-not-found":
          errorMessage = "User not found. Please check your credentials.";
          break;
        case "auth/wrong-password":
          errorMessage = "Invalid password. Please try again.";
          break;
        case "auth/network-request-failed":
          errorMessage =
            "Network request failed. Please check your internet connection.";
          break;
        case "auth/weak-password":
          errorMessage = "Password should be at least 6 characters long.";
          break;
        // Add more cases for other error codes as needed
      }

      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <View style={styles.page}>
      <KeyboardAvoidingView style={styles.loginContainer} behavior="padding">
        <Text style={styles.title}>Sign Up</Text>
        <TextInput
          style={styles.input}
          placeholderTextColor="white"
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
        />
        <TextInput
          style={styles.input}
          placeholderTextColor="white"
          placeholder="First Name"
          value={firstName}
          onChangeText={setFirstName}
          autoCapitalize="words" // Capitalize the first letter of each word
        />
        <TextInput
          style={styles.input}
          placeholderTextColor="white"
          placeholder="Last Name"
          value={lastName}
          onChangeText={setLastName}
          autoCapitalize="words" // Capitalize the first letter of each word
        />
        <TextInput
          style={styles.input}
          placeholderTextColor="white"
          placeholder="Username" // Add placeholder for username
          value={username} // Bind value to username state
          onChangeText={setUsername} // Update state on change
          autoCapitalize="none"
        />
        <View style={styles.passwordInputContainer}>
          <TextInput
            style={styles.passwordInput}
            placeholderTextColor="white"
            placeholder="Password"
            secureTextEntry={!showPassword}
            value={password}
            onChangeText={setPassword}
          />
          <TouchableOpacity
            onPress={togglePasswordVisibility}
            style={styles.showHideButton}
          >
            <Text style={styles.showHideButtonText}>
              {showPassword ? "Hide" : "Show"}
            </Text>
          </TouchableOpacity>
        </View>
        <View style={styles.passwordInputContainer}>
          <TextInput
            style={styles.passwordInput}
            placeholderTextColor="white"
            placeholder="Confirm Password"
            secureTextEntry={!showPassword}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
          />
          <TouchableOpacity
            onPress={togglePasswordVisibility}
            style={styles.showHideButton}
          >
            <Text style={styles.showHideButtonText}></Text>
          </TouchableOpacity>
        </View>
        {error && <Text style={styles.error}>{error}</Text>}
        {loading ? (
          <ActivityIndicator size="100" color="#0000ff" />
        ) : (
          <>
            <TouchableOpacity onPress={signUp} style={styles.buttonContainer}>
              <Text style={styles.buttonText}>Create Account</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => navigation.navigate("Welcome")}
              style={styles.forgotContainer}
            >
              <Text style={styles.buttonText}>Back to Sign In</Text>
            </TouchableOpacity>
          </>
        )}
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: "black",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
    width: "100%", // Ensure the container occupies full width of the screen
  },
  loginContainer: {
    flex: 1,
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
    width: "100%", // Ensure the container occupies full width of the screen
  },
  logo: {
    width: 150, // adjust width as needed
    height: 150, // adjust height as needed
  },
  title: {
    color: "white",
    fontSize: 40,
    marginBottom: 15,
    textAlign: "center",
  },
  input: {
    minWidth: "75%",
    maxWidth: "75%",
    height: 40,
    borderWidth: 1,
    borderColor: "gray",
    borderRadius: 5,
    margin: 8,
    paddingHorizontal: 10,
    color: "white",
  },
  passwordInputContainer: {
    minWidth: "75%",
    maxWidth: "75%",
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  passwordInput: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderColor: "gray",
    borderRadius: 5,
    marginTop: 8,
    paddingHorizontal: 10,
    color: "white",
  },
  error: {
    color: "red",
    marginBottom: 10,
  },
  showHideButton: {
    padding: 10,
    position: "absolute",
    right: 0,
  },
  showHideButtonText: {
    color: "white",
  },
  error: {
    color: "red",
    marginBottom: 10,
  },
  buttonContainer: {
    minWidth: "50%",
    borderRadius: 5,
    margin: 5,
    backgroundColor: "blue",
    alignItems: "center",
    padding: 10,
  },
  forgotContainer: {
    minWidth: "50%",
    borderRadius: 5,
    backgroundColor: "transparent",
    alignItems: "center",
    padding: 10,
  },
  buttonText: {
    color: "white", // Text color
    fontWeight: "bold",
  },
});

export default SignUp;
