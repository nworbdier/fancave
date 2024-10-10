import React from "react";
import { View, Text, StyleSheet, FlatList, SafeAreaView } from "react-native";
import NavBar from "../components/navBar";

export default function ActivityCenter() {
  const activity = [
    {
      id: "1",
      message: "Welcome to the FanCave App!",
    },
    {
      id: "2",
      message: "Follow us on Twitter/X @FanCaveApp",
    },
  ];

  const notifications = [
    {
      id: "1",
      message: "@nworbdier added you as a friend",
    },
    { id: "2", message: "Francisco Lindor grand slam to win it for the Mets" },
    { id: "3", message: "Indiana Pacers win versus the Bulls 102-99" },
  ];

  const renderSeparator = () => <View style={styles.separator} />;

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Activity Center</Text>
        <View style={styles.activityHeader}>
          <Text style={styles.activityHeaderText}>Activity</Text>
          <FlatList
            data={activity}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <Text style={styles.notification}>{item.message}</Text>
            )}
            ItemSeparatorComponent={renderSeparator} // Added separator
          />
        </View>
        <View style={styles.notificationHeader}>
          <Text style={styles.notificationHeaderText}>Notifications</Text>
          <FlatList
            data={notifications}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <Text style={styles.notification}>{item.message}</Text>
            )}
            ItemSeparatorComponent={renderSeparator} // Added separator
          />
        </View>
      </View>
      <NavBar />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "black",
  },
  content: {
    flex: 11.5,
    backgroundColor: "black",
    paddingHorizontal: 20,
  },
  title: {
    color: "white",
    fontSize: 24,
    marginBottom: 10,
    fontWeight: "bold",
    marginTop: 20,
  },
  activityHeader: {
    marginVertical: 10,
  },
  activityHeaderText: {
    color: "grey",
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
  },
  notificationHeader: {
    marginVertical: 10,
  },
  notificationHeaderText: {
    color: "grey",
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
  },
  notification: {
    color: "white",
    fontSize: 16,
    marginVertical: 5,
    marginLeft: 10,
  },
  separator: {
    height: 1,
    backgroundColor: "grey", // Change this color as needed
    marginVertical: 10, // Space around the separator
  },
});
