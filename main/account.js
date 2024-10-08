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
import { FIREBASE_AUTH } from "../firebaseConfig"; // Import Firebase Auth
import { deleteUser } from "firebase/auth"; // Import deleteUser from Firebase Auth
import * as ImagePicker from "expo-image-picker"; // Import expo-image-picker

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
  const [selectedImageUri, setSelectedImageUri] = useState(null);

  const fetchUserData = useCallback(async () => {
    const currentUser = FIREBASE_AUTH.currentUser; // Get current user from Firebase
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
        setFirstName(data.firstname || "");
        setLastName(data.lastname || "");
        setEmail(data.email || "");
        setInitialValues({
          firstName: data.firstname || "",
          lastName: data.lastNnme || "",
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
    firstName === initialValues.firstname &&
    lastName === initialValues.lastName &&
    email === initialValues.email;

  const handleUpdateProfile = async () => {
    const currentUser = FIREBASE_AUTH.currentUser; // Get current user from Firebase
    if (currentUser) {
      try {
        let imageUrl = null; // Initialize imageUrl

        // Check if an image was selected (removed upload logic)
        if (selectedImageUri) {
          // Removed uploadImageToUploadThing function call
          imageUrl = selectedImageUri; // Use the selected image URI directly
        }

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
              lastName, // Corrected spelling from lastame to lastName
              email,
              profileImageUrl: imageUrl, // Include the image URL
            }),
          }
        );

        if (!response.ok) {
          throw new Error("Failed to update profile");
        }

        const result = await response.json();
        console.log(result.message); // Handle success message
        Alert.alert(
          "Account Updated",
          "Your account has been updated successfully!",
          [{ text: "OK" }]
        ); // Show alert on success

        // Fetch user data again to refresh the state
        await fetchUserData(); // Fetch user data again after update
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
            const currentUser = FIREBASE_AUTH.currentUser; // Get current user from Firebase
            if (currentUser) {
              try {
                // Delete the user from Firebase
                await deleteUser(currentUser);

                // Send DELETE request to your API to remove the user from the database
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

  const handlePickImage = async () => {
    // Request permission to access the camera roll
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (permissionResult.granted === false) {
      Alert.alert("Permission to access camera roll is required!");
      return;
    }

    // Launch the image picker
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (result.cancelled) {
      console.log("User cancelled image picker");
    } else {
      setSelectedImageUri(result.uri); // Store the selected image URI
      console.log("Selected image: ", result.uri);
    }
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
        <View style={styles.profileImageContainer}>
          <View style={styles.profileImage}></View>
          <TouchableOpacity onPress={handlePickImage} style={styles.editButton}>
            <Text style={styles.editButtonText}>Edit</Text>
          </TouchableOpacity>
        </View>
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
  profileImageContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  editButton: {
    marginLeft: 10,
    backgroundColor: "lightblue",
    borderRadius: 5,
    padding: 5,
  },
  editButtonText: {
    color: "black",
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
    marginTop: 20, // Add some space above the delete button
  },
});

export default Account; // Updated export statement
