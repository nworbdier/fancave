import { signInWithEmailAndPassword } from "firebase/auth";
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  TouchableOpacity,
  Image,
} from "react-native";
import { FIREBASE_AUTH } from "../firebaseConfig";
import { useNavigation } from "@react-navigation/native";

const Welcome = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const auth = FIREBASE_AUTH;

  const navigation = useNavigation();

  const signInAsync = async () => {
    setLoading(true);
    try {
      const response = await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      let errorMessage = "An error occurred. Please try again.";

      switch (error.code) {
        case "auth/invalid-credential":
          errorMessage =
            "Invalid Email/Password combination. Please try again.";
          break;
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
        <Text style={styles.title}>Sign In</Text>
        <TextInput
          style={styles.input}
          placeholderTextColor="white"
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
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
        {error && <Text style={styles.error}>{error}</Text>}
        {loading ? (
          <ActivityIndicator size="100" color="#0000ff" />
        ) : (
          <>
            <TouchableOpacity
              onPress={signInAsync}
              style={styles.buttonContainer}
            >
              <Text style={styles.buttonText}>Sign In</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => navigation.navigate("SignUp")}
              style={styles.forgotContainer}
            >
              <Text style={styles.buttonText}>Create Account</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => navigation.navigate("PasswordReset")}
              style={styles.forgotContainer}
            >
              <Text style={styles.buttonText}>Forgot Password?</Text>
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
  },
  loginContainer: {
    flex: 1,
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
    width: "100%",
  },
  logo: {
    width: 150, // adjust width as needed
    height: 150, // adjust height as needed
  },
  title: {
    color: "white",
    fontSize: 50,
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
    marginBottom: 10,
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
    paddingHorizontal: 10,
    color: "white",
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
    width: "50%",
    borderRadius: 5,
    margin: 5,
    backgroundColor: "blue",
    alignItems: "center",
    padding: 10,
  },
  forgotContainer: {
    width: "50%",
    borderRadius: 5,
    backgroundColor: "transparent",
    alignItems: "center",
    padding: 8,
  },
  buttonText: {
    color: "white", // Text color
    fontWeight: "bold",
  },
});

export default Welcome;
