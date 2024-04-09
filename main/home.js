import React, { useState, useEffect } from "react";
import { StatusBar, RefreshControl } from "react-native";
import {
  StyleSheet,
  View,
  SafeAreaView,
  TouchableOpacity,
  Image,
  Text,
  ActivityIndicator,
  FlatList,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import NavBar from "../components/navBar";

export default function App() {
  const navigation = useNavigation();
  const [tweets, setTweets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false); // State for pull-to-refresh
  const [selectedImage, setSelectedImage] = useState(null); // State to track selected image

  useEffect(() => {
    fetchTwitterListTimeline();
  }, []);

  const fetchTwitterListTimeline = async () => {
    const list_id = "1777306887953805810";
    const url = "https://twitter-api45.p.rapidapi.com/listtimeline.php";
    const querystring = { list_id: list_id };
    const headers = {
      "X-RapidAPI-Key": process.env.EXPO_PUBLIC_RAPID_API_KEY,
      "X-RapidAPI-Host": "twitter-api45.p.rapidapi.com",
    };

    try {
      const response = await fetch(
        url + "?" + new URLSearchParams(querystring),
        { headers }
      );
      const data = await response.json();
      setTweets(data.timeline);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching Twitter list timeline:", error);
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true); // Set refreshing state to true
    await fetchTwitterListTimeline(); // Fetch new data
    setRefreshing(false); // Reset refreshing state
  };

  const renderTweetItem = ({ item }) => (
    <View style={styles.tweetContainer}>
      <Text style={styles.author}>@{item.screen_name}</Text>
      <Text style={styles.tweetText}>{item.text}</Text>
      {item.media && item.media.photo && item.media.photo[0] && (
        <TouchableOpacity
          onPress={() => setSelectedImage(item.media.photo[0].media_url_https)}
        >
          <Image
            source={{ uri: item.media.photo[0].media_url_https }}
            style={styles.tweetImage}
          />
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <View style={styles.app}>
      <StatusBar style="auto" />
      <SafeAreaView />
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerText}>Purdue Boilermakers</Text>
        </View>
        <TouchableOpacity onPress={() => navigation.navigate("Account")}>
          <Ionicons name="settings" size={24} color="black" />
        </TouchableOpacity>
      </View>
      <View style={styles.content}>
        {loading ? (
          <ActivityIndicator size="large" color="#0000ff" />
        ) : (
          <FlatList
            data={tweets}
            renderItem={renderTweetItem}
            keyExtractor={(item, index) => index.toString()}
            refreshControl={
              // Add RefreshControl to enable pull-to-refresh
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
          />
        )}
      </View>
      <NavBar />

      {selectedImage && (
        <View style={styles.fullImageContainer}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setSelectedImage(null)}
          >
            <Ionicons name="close" size={24} color="white" />
          </TouchableOpacity>
          <Image source={{ uri: selectedImage }} style={styles.fullImage} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  app: {
    flex: 1,
    backgroundColor: "white",
  },
  header: {
    flex: 1,
    backgroundColor: "grey",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 10,
  },
  headerText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "white",
  },
  content: {
    flex: 10,
  },
  tweetContainer: {
    alignItems: "center",
    justifyContent: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    paddingVertical: 10,
    paddingHorizontal: 15,
  },
  tweetText: {
    fontSize: 16,
    textAlign: "center",
  },
  tweetImage: {
    width: 200, // Adjust the width and height according to your design
    height: 200,
    resizeMode: "cover",
    marginTop: 10,
  },
  author: {
    fontWeight: "bold",
    marginBottom: 5,
  },
  fullImageContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.9)",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 999,
  },
  fullImage: {
    width: "80%",
    height: "80%",
    resizeMode: "contain",
  },
  closeButton: {
    position: "absolute",
    top: 50,
    right: 20,
    zIndex: 1000,
  },
});
