import React, { useState, useEffect } from "react";
import { StyleSheet, View, Text, Switch } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";

const Notifications = () => {
  const [allowNotifications, setAllowNotifications] = useState(true); // Default to true
  const [posts, setPosts] = useState(true); // Default to true
  const [scores, setScores] = useState(true); // Default to true

  // Load saved notification settings from AsyncStorage on component mount
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const savedAllowNotifications = await AsyncStorage.getItem(
          "allowNotifications"
        );
        const savedPosts = await AsyncStorage.getItem("posts");
        const savedScores = await AsyncStorage.getItem("scores");

        if (savedAllowNotifications !== null) {
          const allowNotificationsValue = JSON.parse(savedAllowNotifications);
          setAllowNotifications(allowNotificationsValue);
          // Set posts and scores based on allowNotifications
          setPosts(allowNotificationsValue ? (savedPosts !== null ? JSON.parse(savedPosts) : true) : false);
          setScores(allowNotificationsValue ? (savedScores !== null ? JSON.parse(savedScores) : true) : false);
        }
      } catch (e) {
        console.log("Failed to load settings from AsyncStorage", e);
      }
    };

    loadSettings();
  }, []);

  // Save settings to AsyncStorage whenever they change
  useEffect(() => {
    const saveSettings = async () => {
      try {
        await AsyncStorage.setItem(
          "allowNotifications",
          JSON.stringify(allowNotifications)
        );
        await AsyncStorage.setItem("posts", JSON.stringify(allowNotifications ? posts : false)); // Update to save false if notifications are off
        await AsyncStorage.setItem("scores", JSON.stringify(allowNotifications ? scores : false)); // Update to save false if notifications are off
      } catch (e) {
        console.log("Failed to save settings to AsyncStorage", e);
      }
    };

    saveSettings();
  }, [allowNotifications, posts, scores]);

  return (
    <View style={styles.container}>
      <SafeAreaView />
      <View>
        <Text style={styles.headerText}>Notifications</Text>
      </View>

      {/* Allow Notifications */}
      <View style={styles.sectionContainer}>
        {/* Manage Notifications */}
        <Text style={styles.sectionHeader}>Manage Notifications</Text>
        <View style={styles.option}>
          <Text style={styles.optionText}>Allow Notifications</Text>
          <Switch
            value={allowNotifications}
            onValueChange={(value) => {
              setAllowNotifications(value);
              if (!value) { // If notifications are turned off, also turn off posts and scores
                setPosts(false);
                setScores(false);
              } else { // If notifications are turned on, set posts and scores to true
                setPosts(true);
                setScores(true);
              }
            }}
            thumbColor={"white"}
            trackColor={{ false: "lightgrey", true: "#5BC236" }}
            ios_backgroundColor="lightgrey"
          />
        </View>

        <View style={styles.option}>
          <Text style={styles.optionText}>Posts</Text>
          <Switch
            value={allowNotifications ? posts : false} // Disable switch if notifications are off
            onValueChange={(value) => allowNotifications && setPosts(value)} // Only allow changing if notifications are on
            thumbColor={"white"}
            trackColor={{ false: "lightgrey", true: "#5BC236" }}
            ios_backgroundColor="lightgrey"
            disabled={!allowNotifications} // Disable switch if notifications are off
          />
        </View>

        <View style={styles.option}>
          <Text style={styles.optionText}>Scores</Text>
          <Switch
            value={allowNotifications ? scores : false} // Disable switch if notifications are off
            onValueChange={(value) => allowNotifications && setScores(value)} // Only allow changing if notifications are on
            thumbColor={"white"}
            trackColor={{ false: "lightgrey", true: "#5BC236" }}
            ios_backgroundColor="lightgrey"
            disabled={!allowNotifications} // Disable switch if notifications are off
          />
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
  sectionContainer: {
    marginVertical: 25,
  },
  sectionHeader: {
    fontSize: 20,
    color: "grey",
    marginBottom: 15,
    fontWeight: "bold",
  },
  option: {
    paddingVertical: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginHorizontal: 15,
  },
  optionText: {
    fontSize: 18,
    color: "white",
    fontWeight: "bold",
  },
});

export default Notifications;
