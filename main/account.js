import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { FIREBASE_AUTH } from "../firebaseConfig"; // Import Firebase Auth
import { deleteUser } from "firebase/auth"; // Import deleteUser from Firebase Auth

const Account = () => {
  const [userData, setUserData] = useState(null);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [initialValues, setInitialValues] = useState({
    firstName: "",
    lastName: "",
    email: "",
  });

  useEffect(() => {
    const fetchUserData = async () => {
      const currentUser = FIREBASE_AUTH.currentUser; // Get current user from Firebase
      if (currentUser) {
        const response = await fetch(
          `https://fancave-api.up.railway.app/users/${currentUser.uid}`
        );
        const data = await response.json();
        setUserData(data);
        setFirstName(data.firstName);
        setLastName(data.lastName);
        setEmail(data.email);
        setInitialValues({
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
        });
      }
    };

    fetchUserData();
  }, []);

  const isButtonDisabled =
    firstName === initialValues.firstName &&
    lastName === initialValues.lastName &&
    email === initialValues.email;

  const handleUpdateProfile = async () => {
    const currentUser = FIREBASE_AUTH.currentUser; // Get current user from Firebase
    if (currentUser) {
      const response = await fetch(
        "https://fancave-api.up.railway.app/post-users",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            uuid: currentUser.uid, // Use the user's UID as uuid
            firstName,
            lastName,
            email,
          }),
        }
      );

      if (response.ok) {
        const result = await response.json();
        console.log(result.message); // Handle success message
        Alert.alert(
          "Account Updated",
          "Your account has been updated successfully!",
          [{ text: "OK" }]
        ); // Show alert on success
      } else {
        const error = await response.json();
        console.error("Error updating profile: ", error);
        Alert.alert(
          "Error",
          "Failed to update your profile. Please try again later."
        );
      }
    }
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      "Confirm",
      "Warning: This will delete your account and revoke access. Are you sure you want to proceed?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          onPress: async () => {
            const currentUser = FIREBASE_AUTH.currentUser; // Get current user from Firebase
            if (currentUser) {
              try {
                await deleteUser(currentUser);
                Alert.alert(
                  "Success",
                  "Your account has been deleted successfully."
                );
                // Optionally, navigate to a different screen or log out
              } catch (error) {
                console.error("Error deleting account: ", error);
                Alert.alert(
                  "Error",
                  "Failed to delete your account. Please try again later."
                );
              }
            }
          },
          style: "destructive",
        },
      ],
      { cancelable: true }
    );
  };

  return (
    <View style={styles.container}>
      <SafeAreaView />
      <View>
        <Text style={styles.headerText}>Account</Text>
      </View>

      {/* Manage Mode */}
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionHeader}>Profile Image</Text>
        <View style={styles.profileImage}></View>
        <Text style={styles.sectionHeader}>First Name</Text>
        <TextInput
          style={styles.input}
          value={firstName}
          onChangeText={setFirstName}
          placeholderTextColor="grey" // Placeholder color set to grey
        />
        <Text style={styles.sectionHeader}>Last Name</Text>
        <TextInput
          style={styles.input}
          value={lastName}
          onChangeText={setLastName}
          placeholderTextColor="grey" // Placeholder color set to grey
        />
        <Text style={styles.sectionHeader}>Email</Text>
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          placeholderTextColor="grey" // Placeholder color set to grey
        />
      </View>

      <TouchableOpacity
        style={[styles.updateButton, isButtonDisabled && styles.disabledButton]}
        disabled={isButtonDisabled}
        onPress={handleUpdateProfile} // Call update function on press
      >
        <Text style={styles.buttonText}>Update Profile</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.deleteButton}
        onPress={handleDeleteAccount} // Call delete function on press
      >
        <Text style={styles.buttonText}>Delete Account</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "black",
    paddingHorizontal: 20,
  },
  headerText: {
    fontSize: 30,
    color: "white",
    fontWeight: "bold",
    marginBottom: 15,
  },
  sectionContainer: {
    marginVertical: 15,
  },
  sectionHeader: {
    fontSize: 20,
    color: "grey",
    marginBottom: 15,
    fontWeight: "bold",
  },
  profileImage: {
    width: 75,
    height: 75,
    borderRadius: 75,
    backgroundColor: "grey",
    marginBottom: 15,
  },
  input: {
    borderWidth: 1,
    borderColor: "grey",
    borderRadius: 10,
    padding: 10,
    marginBottom: 15,
    color: "white",
  },
  updateButton: {
    backgroundColor: "lightgrey",
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: "center",
  },
  disabledButton: {
    backgroundColor: "grey",
    opacity: 0.3,
  },
  buttonText: {
    fontSize: 18,
    color: "black",
    fontWeight: "bold",
  },
  deleteButton: {
    backgroundColor: "darkred",
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: "center",
    marginTop: 20, // Add some space above the delete button
  },
});

export default Account; // Updated export statement
