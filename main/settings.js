import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  Alert,
  TouchableOpacity,
  Linking,
  ScrollView,
} from "react-native";
import { MaterialIcons, FontAwesome6 } from "@expo/vector-icons";
import { FIREBASE_AUTH } from "../firebaseConfig";
import { signOut } from "firebase/auth";
import { useNavigation, useFocusEffect } from "@react-navigation/native";

const Settings = ({}) => {
  const navigation = useNavigation();
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);

  const fetchUserData = async (currentUser) => {
    if (currentUser) {
      // console.log("Current User UID:", currentUser.uid); // Log the UID for verification
      const url = `https://fancave-api.up.railway.app/users/${currentUser.uid}`;
      // console.log("Fetching user data from URL:", url); // Log the URL
      const response = await fetch(url);
      const data = await response.json();
      setUserData(data);
      // await AsyncStorage.setItem("userData", JSON.stringify(data)); // Remove this line
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      const currentUser = FIREBASE_AUTH.currentUser;
      setUser(currentUser);
      const loadUserData = async () => {
        fetchUserData(currentUser); // Fetch if no cached data
      };
      loadUserData();
    }, [])
  );

  const handleLogout = async () => {
    try {
      await signOut(FIREBASE_AUTH);
      // await AsyncStorage.removeItem("userData"); // Remove this line
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

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Settings</Text>
      </View>
      <ScrollView>
        {userData && (
          <View style={styles.accountSection}>
            <View style={styles.userInfo}>
              <Text style={styles.userUsername}>{userData.username}</Text>
              <Text style={styles.userEmail}>{userData.email}</Text>
            </View>
          </View>
        )}
        {/* General Settings */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionHeader}>General</Text>
          <TouchableOpacity
            style={styles.option}
            onPress={() => navigation.navigate("NotificationSettings")}
          >
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <MaterialIcons name="notifications" size={24} color="white" />
              <Text style={styles.optionText}>Notifications</Text>
            </View>
            <MaterialIcons
              name="keyboard-arrow-right"
              size={24}
              color="white"
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.option}
            onPress={() => navigation.navigate("ThemeSettings")}
          >
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <MaterialIcons name="palette" size={24} color="white" />
              <Text style={styles.optionText}>Theme</Text>
            </View>
            <MaterialIcons
              name="keyboard-arrow-right"
              size={24}
              color="white"
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.option}
            onPress={() => navigation.navigate("ReorderSports")}
          >
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <MaterialIcons name="sports-soccer" size={24} color="white" />
              <Text style={styles.optionText}>Sports</Text>
            </View>
            <MaterialIcons
              name="keyboard-arrow-right"
              size={24}
              color="white"
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.option}
            onPress={() => navigation.navigate("Account")}
          >
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <MaterialIcons name="manage-accounts" size={24} color="white" />
              <Text style={styles.optionText}>Account</Text>
            </View>
            <MaterialIcons
              name="keyboard-arrow-right"
              size={24}
              color="white"
            />
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
            <MaterialIcons
              name="keyboard-arrow-right"
              size={24}
              color="white"
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.option}
            onPress={() => navigation.navigate("Feedback")}
          >
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <MaterialIcons name="feedback" size={24} color="white" />
              <Text style={styles.optionText}>Feedback</Text>
            </View>
            <MaterialIcons
              name="keyboard-arrow-right"
              size={24}
              color="white"
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.option}
            onPress={() => openLink("https://example.com/support")}
          >
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <MaterialIcons name="support" size={24} color="white" />
              <Text style={styles.optionText}>Support</Text>
            </View>
            <MaterialIcons
              name="keyboard-arrow-right"
              size={24}
              color="white"
            />
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
            <MaterialIcons
              name="keyboard-arrow-right"
              size={24}
              color="white"
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.option}
            onPress={() => openLink("https://example.com/terms")}
          >
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <MaterialIcons name="gavel" size={24} color="white" />
              <Text style={styles.optionText}>Terms of Service</Text>
            </View>
            <MaterialIcons
              name="keyboard-arrow-right"
              size={24}
              color="white"
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.option}
            onPress={() => openLink("https://example.com/privacy")}
          >
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <MaterialIcons name="privacy-tip" size={24} color="white" />
              <Text style={styles.optionText}>Privacy Policy</Text>
            </View>
            <MaterialIcons
              name="keyboard-arrow-right"
              size={24}
              color="white"
            />
          </TouchableOpacity>
        </View>

        {/* Logout and Delete Account */}
        <View style={styles.sectionContainer}>
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.logoutOption}
              onPress={handleLogout}
            >
              <Text style={styles.logoutText}>Logout</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "black",
    paddingTop: 20,
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
  userUsername: {
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
