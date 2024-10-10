import React from "react";
import { View, Text, StyleSheet, FlatList, SafeAreaView } from "react-native";
import NavBar from "../components/navBar";

export default function NotificationCenter() {
  const notifications = [
    { id: "1", message: "You have a new message!" },
    { id: "2", message: "Your profile has been updated." },
    { id: "3", message: "New friend request received." },
  ];

  return (
    <View style={styles.container}>
      <SafeAreaView />
      <View style={styles.content}>
        <Text style={styles.title}>Notifications</Text>
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <Text style={styles.notification}>{item.message}</Text>
          )}
        />
      </View>
      <NavBar />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "black",
    paddingHorizontal: 5,
  },
  content: {
    flex: 11.5,
    backgroundColor: "black",
    padding: 20,
  },
  title: {
    color: "white",
    fontSize: 24,
    marginBottom: 10,
    fontWeight: "bold",
    marginTop: 20,
  },
  notification: {
    color: "white",
    fontSize: 16,
    marginVertical: 5,
  },
});
