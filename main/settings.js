import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  Alert,
  TouchableOpacity,
  Linking,
} from "react-native";
import { MaterialIcons, FontAwesome6 } from "@expo/vector-icons";
import { FIREBASE_AUTH } from "../firebaseConfig";
import {
  signOut,
  deleteUser,
  reauthenticateWithCredential,
} from "firebase/auth";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { EmailAuthProvider } from "firebase/auth";

const Settings = ({}) => {
  const navigation = useNavigation();
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [shouldFetchUserData, setShouldFetchUserData] = useState(false); // New state for re-fetching user data

  useEffect(() => {
    const unsubscribe = FIREBASE_AUTH.onAuthStateChanged(
      async (currentUser) => {
        setUser(currentUser);
        if (currentUser) {
          // Fetch user data from the API
          const response = await fetch(
            `https://fancave-api.up.railway.app/users/${currentUser.uid}`
          );
          const data = await response.json();
          setUserData(data);
        }
      }
    );
    return unsubscribe;
  }, [shouldFetchUserData]); // Add shouldFetchUserData to the dependency array

  const handleLogout = async () => {
    try {
      await signOut(FIREBASE_AUTH);
    } catch (error) {
      console.error("Error signing out: ", error);
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
            try {
              const email = user.email;
              const password = prompt(
                "Please enter your password to confirm deletion:"
              );

              const credential = EmailAuthProvider.credential(email, password);
              await reauthenticateWithCredential(
                FIREBASE_AUTH.currentUser,
                credential
              );

              await fetch(
                `https://fancave-api.up.railway.app/users/${user.uid}`,
                {
                  method: "DELETE",
                }
              );

              await deleteUser(FIREBASE_AUTH.currentUser);
              Alert.alert(
                "Success",
                "Your account has been deleted successfully."
              );

              // Trigger re-fetch of user data
              setShouldFetchUserData((prev) => !prev); // Toggle the state to trigger re-fetch
            } catch (error) {
              console.error("Error deleting account: ", error);
              Alert.alert(
                "Error",
                "Failed to delete your account. Please try again later."
              );
            }
          },
          style: "destructive",
        },
      ],
      { cancelable: true }
    );
  };

  const openLink = async (url) => {
    try {
      await Linking.openURL(url);
    } catch (error) {
      console.error("Error opening link: ", error);
    }
  };

  const handleUpdateProfile = async (updatedData) => {
    try {
      // Assuming updatedData is an object containing the updated user information
      const response = await fetch(
        `https://fancave-api.up.railway.app/users/${user.uid}`,
        {
          method: "PUT", // Use PUT method to update user data
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updatedData),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update profile");
      }

      Alert.alert("Success", "Your profile has been updated successfully.");

      // Trigger re-fetch of user data
      setShouldFetchUserData((prev) => !prev); // Toggle the state to trigger re-fetch
    } catch (error) {
      console.error("Error updating profile: ", error);
      Alert.alert(
        "Error",
        "Failed to update your profile. Please try again later."
      );
    }
  };

  const confirmUpdateProfile = () => {
    Alert.alert(
      "Confirm",
      "Are you sure you want to update your profile?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "OK",
          onPress: () => {
            const updatedData = {
              firstName: "NewFirstName", // Replace with actual data
              lastName: "NewLastName", // Replace with actual data
              email: "newemail@example.com", // Replace with actual data
            };
            handleUpdateProfile(updatedData);
          },
        },
      ],
      { cancelable: true }
    );
  };

  return (
    <View style={styles.container}>
      <SafeAreaView />
      <View style={styles.header}>
        <Text style={styles.headerText}>Settings</Text>
      </View>
      {userData && (
        <View style={styles.accountSection}>
          <View style={styles.profileCircle} />
          <View style={styles.userInfo}>
            <Text style={styles.userFirstLast}>
              {userData.firstName} {userData.lastName}
            </Text>
            <Text style={styles.userEmail}>{userData.email}</Text>
          </View>
        </View>
      )}
      {/* General Settings */}
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionHeader}>General</Text>
        <TouchableOpacity
          style={styles.option}
          onPress={() => navigation.navigate("Notifications")}
        >
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <MaterialIcons name="notifications" size={24} color="white" />
            <Text style={styles.optionText}>Notifications</Text>
          </View>
          <MaterialIcons name="keyboard-arrow-right" size={24} color="white" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.option}
          onPress={() => navigation.navigate("Theme")}
        >
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <MaterialIcons name="palette" size={24} color="white" />
            <Text style={styles.optionText}>Theme</Text>
          </View>
          <MaterialIcons name="keyboard-arrow-right" size={24} color="white" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.option}
          onPress={() => navigation.navigate("Account")}
        >
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <MaterialIcons name="manage-accounts" size={24} color="white" />
            <Text style={styles.optionText}>Account</Text>
          </View>
          <MaterialIcons name="keyboard-arrow-right" size={24} color="white" />
        </TouchableOpacity>
      </View>

      {/* Contact Section */}
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionHeader}>Contact</Text>
        <TouchableOpacity
          style={styles.option}
          onPress={() => openLink("https://discord.com")}
        >
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <FontAwesome6 name="x-twitter" size={24} color="white" />
            <Text style={styles.optionText}>FanCave X</Text>
          </View>
          <MaterialIcons name="keyboard-arrow-right" size={24} color="white" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.option}
          onPress={() => openLink("https://example.com/feedback")}
        >
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <MaterialIcons name="feedback" size={24} color="white" />
            <Text style={styles.optionText}>Feedback</Text>
          </View>
          <MaterialIcons name="keyboard-arrow-right" size={24} color="white" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.option}
          onPress={() => openLink("https://example.com/support")}
        >
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <MaterialIcons name="support" size={24} color="white" />
            <Text style={styles.optionText}>Support</Text>
          </View>
          <MaterialIcons name="keyboard-arrow-right" size={24} color="white" />
        </TouchableOpacity>
      </View>

      {/* Legal Info Section */}
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionHeader}>Legal</Text>
        <TouchableOpacity
          style={styles.option}
          onPress={() => openLink("https://example.com/faq")}
        >
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <MaterialIcons name="question-answer" size={24} color="white" />
            <Text style={styles.optionText}>FAQ</Text>
          </View>
          <MaterialIcons name="keyboard-arrow-right" size={24} color="white" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.option}
          onPress={() => openLink("https://example.com/terms")}
        >
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <MaterialIcons name="gavel" size={24} color="white" />
            <Text style={styles.optionText}>Terms of Service</Text>
          </View>
          <MaterialIcons name="keyboard-arrow-right" size={24} color="white" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.option}
          onPress={() => openLink("https://example.com/privacy")}
        >
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <MaterialIcons name="privacy-tip" size={24} color="white" />
            <Text style={styles.optionText}>Privacy Policy</Text>
          </View>
          <MaterialIcons name="keyboard-arrow-right" size={24} color="white" />
        </TouchableOpacity>
      </View>

      {/* Logout and Delete Account */}
      <View style={styles.sectionContainer}>
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.logoutOption} onPress={handleLogout}>
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </View>
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
  },
  accountSection: {
    flexDirection: "row",
    alignItems: "center",
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 20,
  },
  userInfo: {
    justifyContent: "center",
    marginVertical: 25,
  },
  userFirstLast: {
    fontSize: 20,
    color: "white",
  },
  userEmail: {
    fontSize: 20,
    color: "grey",
    marginTop: 10,
  },
  sectionContainer: {
    marginBottom: 30,
  },
  sectionHeader: {
    fontSize: 20,
    color: "lightgray",
    marginBottom: 10,
    fontWeight: "bold",
  },
  option: {
    paddingVertical: 10,
    marginLeft: 5,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  optionText: {
    fontSize: 20,
    color: "white",
    fontWeight: "regular",
    marginLeft: 10,
  },
  logoutOption: {
    borderWidth: 1,
    borderColor: "white",
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 30,
  },
  logoutText: {
    fontSize: 18,
    color: "yellow",
    fontWeight: "bold",
  },
  deleteText: {
    fontSize: 18,
    color: "darkred",
    fontWeight: "bold",
  },
  buttonContainer: {
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 20,
  },
  profileCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "white",
    marginRight: 15,
    alignSelf: "center",
  },
});

export default Settings;
