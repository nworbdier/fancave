import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  Alert,
  TouchableOpacity,
  Linking,
  Image,
} from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { FIREBASE_AUTH } from "../firebaseConfig";
import { signOut, deleteUser } from "firebase/auth";
import { SafeAreaView } from "react-native-safe-area-context";

const Settings = ({ navigation }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = FIREBASE_AUTH.onAuthStateChanged(setUser);
    return unsubscribe;
  }, []);

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
              await deleteUser(FIREBASE_AUTH.currentUser);
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

  return (
    <View style={styles.container}>
      <SafeAreaView />
      <View style={styles.header}>
        <Text style={styles.headerText}>Settings</Text>
      </View>
      {user && (
        <View style={styles.accountSection}>
          <Image
            source={{ uri: "https://example.com/user-profile.jpg" }}
            style={styles.profileImage}
          />
          <View style={styles.userInfo}>
            <Text style={styles.userEmail}>{user.email}</Text>
          </View>
        </View>
      )}
      {/* General Settings */}
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionHeader}>General</Text>
        <TouchableOpacity style={styles.option}>
          <Text style={styles.optionText}>Notifications</Text>
          <MaterialIcons name="keyboard-arrow-right" size={24} color="white" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.option}>
          <Text style={styles.optionText}>Theme</Text>
          <MaterialIcons name="keyboard-arrow-right" size={24} color="white" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.option}>
          <Text style={styles.optionText}>Edit Profile</Text>
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
          <Text style={styles.optionText}>Join Discord</Text>
          <MaterialIcons name="keyboard-arrow-right" size={24} color="white" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.option}
          onPress={() => openLink("https://example.com/feedback")}
        >
          <Text style={styles.optionText}>Feedback</Text>
          <MaterialIcons name="keyboard-arrow-right" size={24} color="white" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.option}
          onPress={() => openLink("https://example.com/support")}
        >
          <Text style={styles.optionText}>Support</Text>
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
          <Text style={styles.optionText}>FAQ</Text>
          <MaterialIcons name="keyboard-arrow-right" size={24} color="white" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.option}
          onPress={() => openLink("https://example.com/terms")}
        >
          <Text style={styles.optionText}>Terms of Service</Text>
          <MaterialIcons name="keyboard-arrow-right" size={24} color="white" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.option}
          onPress={() => openLink("https://example.com/privacy")}
        >
          <Text style={styles.optionText}>Privacy Policy</Text>
          <MaterialIcons name="keyboard-arrow-right" size={24} color="white" />
        </TouchableOpacity>
      </View>

      {/* Logout and Delete Account */}
      <View style={styles.sectionContainer}>
        <TouchableOpacity style={styles.logoutOption} onPress={handleLogout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.deleteOption}
          onPress={handleDeleteAccount}
        >
          <Text style={styles.deleteText}>Delete Account</Text>
        </TouchableOpacity>
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
  },
  userEmail: {
    fontSize: 18,
    color: "white",
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
    marginLeft: 20,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  optionText: {
    fontSize: 18,
    color: "white",
    fontWeight: "regular",
  },
  logoutOption: {
    paddingBottom: 15,
  },
  logoutText: {
    fontSize: 18,
    color: "red",
    fontWeight: "bold",
  },

  deleteText: {
    fontSize: 18,
    color: "darkred",
    fontWeight: "bold",
  },
});

export default Settings;
