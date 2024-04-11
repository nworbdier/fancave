import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  Alert,
  TouchableOpacity,
  Linking,
  Platform,
} from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import { FIREBASE_AUTH } from "../firebaseConfig";
import { signOut, deleteUser } from "firebase/auth";

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
      "Warning: This will delete your account data and your access to BetHQ will be revoked. Are you sure you want to proceed?",
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
        {Platform.OS === "android" && (
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <FontAwesome name="arrow-left" size={24} color="white" />
          </TouchableOpacity>
        )}
      </View>
      <View style={styles.content}>
        {user ? (
          <View style={styles.accountContainer}>
            <Text style={styles.headerText}>Account</Text>
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
            <View style={styles.socialView}></View>
          </View>
        ) : (
          <Text style={styles.text}>You are not logged in.</Text>
        )}
      </View>
      <View style={styles.footer}></View>
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
    backgroundColor: "rgba(0, 0, 0, 0.7)", // Black color with 50% opacity
    justifyContent: "space-between",
    alignItems: "center",
    flexDirection: "row",
    paddingHorizontal: 30,
  },
  content: {
    flex: 8,
    backgroundColor: "rgba(0, 0, 0, 0.7)", // Black color with 50% opacity
    justifyContent: "center",
    alignItems: "center",
  },
  footer: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)", // Black color with 50% opacity
    justifyContent: "center",
    alignItems: "center",
  },
  headerText: {
    fontSize: 30,
    color: "white",
    fontWeight: "bold",
    paddingBottom: 10,
  },
  accountContainer: {
    alignItems: "center",
  },
  userInfo: {
    flexDirection: "column",
    alignItems: "center",
  },
  title: {
    fontSize: 20,
    color: "white",
    fontWeight: "bold",
    marginBottom: 10,
  },
  text: {
    fontSize: 20,
    color: "white",
    marginBottom: 20,
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
    marginBottom: 10,
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
  },
  socialHeader: {
    color: "white",
    fontWeight: "bold",
    marginBottom: 10,
    marginTop: 10,
    fontSize: 20,
  },
  socialView: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
});

export default AccountScreen;
