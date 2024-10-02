import React, { useState } from "react";
import { StyleSheet, View, Text, Switch } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const Notifications = () => {
  const [allowNotifications, setAllowNotifications] = useState(true); // Default to true
  const [posts, setPosts] = useState(true); // Default to true
  const [scores, setScores] = useState(true); // Default to true

  return (
    <View style={styles.container}>
      <SafeAreaView />
      <View>
        <Text style={styles.headerText}>Notifications</Text>
      </View>

      {/* Allow Notifications */}
      <View style={styles.sectionContainer}>
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

        {/* Manage Notifications */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionHeader}>Manage Notifications</Text>

          <View style={styles.option}>
            <Text style={styles.optionText2}>Posts</Text>
            <Switch
              value={posts}
              onValueChange={(value) => setPosts(value)}
              thumbColor={"white"}
              trackColor={{ false: "lightgrey", true: "#5BC236" }}
              ios_backgroundColor="lightgrey"
            />
          </View>

          <View style={styles.option}>
            <Text style={styles.optionText2}>Scores</Text>
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
    marginVertical: 20,
  },
  sectionContainer: {
    marginVertical: 15,
  },
  sectionHeader: {
    fontSize: 20,
    color: "lightgray",
    marginBottom: 15,
    fontWeight: "bold",
  },
  option: {
    paddingVertical: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  optionText: {
    fontSize: 18,
    color: "white",
    fontWeight: "regular",
  },
  optionText2: {
    fontSize: 18,
    color: "white",
    fontWeight: "regular",
    marginLeft: 15,
  },
});

export default Notifications;
