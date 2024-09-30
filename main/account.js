import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  Alert,
  TouchableOpacity,
  Linking,
  Platform,
  Image,
} from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import { FIREBASE_AUTH } from "../firebaseConfig";
import { signOut, deleteUser } from "firebase/auth";s

const AccountScreen = ({ navigation }) => {
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

  const openLink = async (url) => {
    try {
      await Linking.openURL(url);
    } catch (error) {
      console.error("Error opening link: ", error);
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

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Settings</Text>
      </View>
      <View style={styles.content}>
        {user ? (
          <View style={styles.accountContainer}>
            <Image
              source={{ uri: "https://example.com/user-profile.jpg" }}
              style={styles.profileImage}
            />
            <View style={styles.userInfo}>
              <Text style={styles.title}>Email:</Text>
              <Text style={styles.text}>{user.email}</Text>
            </View>
            <TouchableOpacity style={styles.button} onPress={handleLogout}>
              <Text style={styles.buttonText}>Logout</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.buttonDelete}
              onPress={handleDeleteAccount}
            >
              <Text style={styles.buttonText}>Delete Account</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <Text style={styles.text}>You are not logged in.</Text>
        )}
      </View>
      <View style={styles.footer}>
        {/* Additional Settings */}
        <TouchableOpacity
          style={styles.linkButton}
          onPress={() => openLink("https://example.com/faq")}
        >
          <Text style={styles.linkText}>FAQ</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.linkButton}
          onPress={() => openLink("https://example.com/terms")}
        >
          <Text style={styles.linkText}>Terms of Service</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.linkButton}
          onPress={() => openLink("https://example.com/privacy")}
        >
          <Text style={styles.linkText}>Privacy Policy</Text>
        </TouchableOpacity>
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
    alignSelf: "center",
    alignItems: "center",
    flexDirection: "row",
    paddingHorizontal: 30,
  },
  content: {
    flex: 2,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  footer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  headerText: {
    fontSize: 30,
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
  },
  accountContainer: {
    alignItems: "center",
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 10,
  },
  profileName: {
    fontSize: 25,
    color: "white",
    fontWeight: "bold",
    marginBottom: 20,
  },
  userInfo: {
    flexDirection: "column",
    alignItems: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    color: "white",
    fontWeight: "bold",
    marginBottom: 10,
  },
  text: {
    fontSize: 18,
    color: "white",
    marginBottom: 10,
  },
  button: {
    minWidth: "40%",
    borderRadius: 5,
    backgroundColor: "blue",
    alignItems: "center",
    padding: 10,
    marginBottom: 10,
  },
  buttonDelete: {
    minWidth: "40%",
    borderRadius: 5,
    backgroundColor: "red",
    alignItems: "center",
    padding: 10,
    marginBottom: 20,
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
  },
  linkButton: {
    padding: 10,
  },
  linkText: {
    color: "lightblue",
    fontSize: 18,
  },
});

export default AccountScreen;
