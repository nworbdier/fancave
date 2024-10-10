import React, { useEffect, useState, useCallback } from "react";
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { FIREBASE_AUTH } from "../firebaseConfig";
import { deleteUser } from "firebase/auth";

const Account = () => {
  const [userData, setUserData] = useState(null);
  const [username, setUsername] = useState(""); // New state for username
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [initialValues, setInitialValues] = useState({
    username: "",
    firstName: "",
    lastName: "",
    email: "",
  });

  const fetchUserData = useCallback(async () => {
    const currentUser = FIREBASE_AUTH.currentUser;
    if (currentUser) {
      try {
        const response = await fetch(
          `https://fancave-api.up.railway.app/users/${currentUser.uid}`
        );
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setUserData(data);
        setUsername(data.username || ""); // Set username
        setFirstName(data.firstname || "");
        setLastName(data.lastname || "");
        setEmail(data.email || "");
        setInitialValues({
          username: data.username || "", // Update initial values
          firstName: data.firstname || "",
          lastName: data.lastname || "",
          email: data.email || "",
        });
      } catch (error) {
        console.error("Error fetching user data:", error);
        Alert.alert("Error", "Failed to fetch user data. Please try again.");
      }
    } else {
      console.warn("No current user found.");
    }
  }, []);

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  const isButtonDisabled =
    username === initialValues.username &&
    firstName === initialValues.firstName &&
    lastName === initialValues.lastName &&
    email === initialValues.email;

  const handleUpdateProfile = async () => {
    const currentUser = FIREBASE_AUTH.currentUser;
    if (currentUser) {
      try {
        const response = await fetch(
          "https://fancave-api.up.railway.app/post-users",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              uuid: currentUser.uid,
              username, // Include username
              firstName,
              lastName,
              email,
            }),
          }
        );

        if (!response.ok) {
          throw new Error("Failed to update profile");
        }

        const result = await response.json();
        console.log(result.message);
        Alert.alert(
          "Account Updated",
          "Your account has been updated successfully!",
          [{ text: "OK" }]
        );

        await fetchUserData(); // Refresh user data from the server
      } catch (error) {
        console.error("Error updating profile:", error);
        Alert.alert("Error", "An unexpected error occurred. Please try again.");
      }
    }
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      "Confirm",
      "Warning: This will delete your account! Are you sure you want to proceed?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          onPress: async () => {
            const currentUser = FIREBASE_AUTH.currentUser;
            if (currentUser) {
              try {
                await deleteUser(currentUser);

                const response = await fetch(
                  `https://fancave-api.up.railway.app/users/${currentUser.uid}`,
                  {
                    method: "DELETE",
                  }
                );

                if (!response.ok) {
                  throw new Error("Failed to delete account from database");
                }

                Alert.alert(
                  "Success",
                  "Your account has been deleted successfully."
                );
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
      <View>
        <Text style={styles.headerText}>Account</Text>
      </View>

      <View style={styles.sectionContainer}>
        <Text style={styles.sectionHeader}>Username</Text>
        <TextInput
          style={styles.input}
          value={username}
          onChangeText={setUsername}
          placeholderTextColor="grey"
          autoCapitalize="none"
        />
        <Text style={styles.sectionHeader}>First Name</Text>
        <TextInput
          style={styles.input}
          value={firstName}
          onChangeText={setFirstName}
          placeholderTextColor="grey"
        />
        <Text style={styles.sectionHeader}>Last Name</Text>
        <TextInput
          style={styles.input}
          value={lastName}
          onChangeText={setLastName}
          placeholderTextColor="grey"
        />
        <Text style={styles.sectionHeader}>Email</Text>
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          placeholderTextColor="grey"
        />
      </View>

      <TouchableOpacity
        style={[styles.updateButton, isButtonDisabled && styles.disabledButton]}
        disabled={isButtonDisabled}
        onPress={handleUpdateProfile}
      >
        <Text style={styles.buttonText}>Update Profile</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.deleteButton]}
        onPress={handleDeleteAccount}
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
    marginTop: 20,
  },
});

export default Account;
