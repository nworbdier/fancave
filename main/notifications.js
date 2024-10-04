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

        if (savedAllowNotifications !== null)
          setAllowNotifications(JSON.parse(savedAllowNotifications));
        if (savedPosts !== null) setPosts(JSON.parse(savedPosts));
        if (savedScores !== null) setScores(JSON.parse(savedScores));
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
        await AsyncStorage.setItem("posts", JSON.stringify(posts));
        await AsyncStorage.setItem("scores", JSON.stringify(scores));
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
            onValueChange={(value) => setAllowNotifications(value)}
            thumbColor={"white"}
            trackColor={{ false: "lightgrey", true: "#5BC236" }}
            ios_backgroundColor="lightgrey"
          />
        </View>

        <View style={styles.option}>
          <Text style={styles.optionText}>Posts</Text>
          <Switch
            value={posts}
            onValueChange={(value) => setPosts(value)}
            thumbColor={"white"}
            trackColor={{ false: "lightgrey", true: "#5BC236" }}
            ios_backgroundColor="lightgrey"
          />
        </View>

        <View style={styles.option}>
          <Text style={styles.optionText}>Scores</Text>
          <Switch
            value={scores}
            onValueChange={(value) => setScores(value)}
            thumbColor={"white"}
            trackColor={{ false: "lightgrey", true: "#5BC236" }}
            ios_backgroundColor="lightgrey"
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
