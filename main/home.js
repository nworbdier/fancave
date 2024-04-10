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
  Modal,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import NavBar from "../components/navBar";
import { FontAwesome6, Ionicons } from "@expo/vector-icons";

export default function App() {
  const navigation = useNavigation();
  const [tweets, setTweets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [selectedTeam, setSelectedTeam] = useState("Purdue Boilermakers"); // Default to Purdue
  const [modalVisible, setModalVisible] = useState(false);

  const listDictionary = {
    "1777306887953805810": "Purdue Boilermakers",
    "1777402248013771060": "Iowa Hawkeyes",
  };

  useEffect(() => {
    fetchTwitterListTimeline();
  }, [selectedTeam]);

  const fetchTwitterListTimeline = async () => {
    const list_id = getKeyByValue(listDictionary, selectedTeam);
    const url = process.env.EXPO_PUBLIC_RAPID_API_URL;
    const querystring = { list_id: list_id };
    const headers = {
      "X-RapidAPI-Key": process.env.EXPO_PUBLIC_RAPID_API_KEY,
      "X-RapidAPI-Host": process.env.EXPO_PUBLIC_RAPID_API_HOST,
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
    setRefreshing(true);
    await fetchTwitterListTimeline();
    setRefreshing(false);
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
            style={styles.tweetMedia}
            resizeMode="contain"
          />
        </TouchableOpacity>
      )}
      {item.quoted && (
        <View style={styles.quotedContainer}>
          <View
            style={{
              alignItems: "center",
              flexDirection: "row",
              paddingBottom: 10,
            }}
          >
            <Image
              source={{ uri: item.quoted.author.avatar }}
              style={[styles.quoteAvatar, { marginRight: 8 }]}
              resizeMode="contain"
            />
            <Text style={styles.quotedAuthor}>
              @{item.quoted.author.screen_name}
            </Text>
          </View>
          <Text style={styles.quotedText}>{item.quoted.text}</Text>
          {item.quoted.media &&
            item.quoted.media.photo &&
            item.quoted.media.photo[0] && (
              <TouchableOpacity
                onPress={() =>
                  setSelectedImage(item.quoted.media.photo[0].media_url_https)
                }
              >
                <Image
                  source={{ uri: item.quoted.media.photo[0].media_url_https }}
                  style={styles.quotedMedia}
                  resizeMode="contain"
                />
              </TouchableOpacity>
            )}
        </View>
      )}
    </View>
  );

  const getKeyByValue = (object, value) => {
    return Object.keys(object).find((key) => object[key] === value);
  };

  return (
    <View style={styles.app}>
      <StatusBar style="auto" />
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(!modalVisible);
        }}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setModalVisible(!modalVisible)}
            >
              <Text style={styles.modalCloseButton}>X</Text>
            </TouchableOpacity>
            <Text style={styles.boldText}>Select Team</Text>
            {Object.values(listDictionary).map((team, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => {
                  setSelectedTeam(team);
                  setModalVisible(!modalVisible);
                }}
              >
                <Text style={styles.modalText}>{team}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>

      <SafeAreaView />
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => setModalVisible(true)}
          style={styles.headerLeft}
        >
          <Text style={styles.headerText}>{selectedTeam}</Text>
          <FontAwesome6
            name="chevron-down"
            size={20}
            color="white"
            marginLeft={5}
          />
        </TouchableOpacity>
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
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            showsVerticalScrollIndicator={false}
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

      {selectedVideo && (
        <View style={styles.fullVideoContainer}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setSelectedVideo(null)}
          >
            <Ionicons name="close" size={24} color="white" />
          </TouchableOpacity>
          <Video
            source={{ uri: selectedVideo }}
            style={styles.fullVideo}
            controls={true}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  app: {
    flex: 1,
    backgroundColor: "grey",
  },
  header: {
    flex: 0.5,
    backgroundColor: "grey",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 10,
  },
  headerLeft: {
    backgroundColor: "grey",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "white",
  },
  content: {
    flex: 10.5,
    paddingTop: 10,
    backgroundColor: "white",
  },
  tweetContainer: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    marginHorizontal: 15,
    backgroundColor: "#f5f8fa", // Twitter background color
  },
  tweetText: {
    fontSize: 16,
    marginBottom: 10,
    lineHeight: 22,
  },
  tweetImage: {
    width: "100%",
    height: 200,
    borderRadius: 10,
    marginBottom: 10,
  },
  author: {
    fontWeight: "bold",
    marginBottom: 5,
    color: "#1da1f2", // Twitter blue
  },
  quotedContainer: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
    backgroundColor: "#f5f8fa", // Twitter background color
  },
  quotedText: {
    marginBottom: 10,
  },
  tweetMedia: {
    width: "100%",
    height: 200,
    borderRadius: 10,
    marginBottom: 10,
  },
  quoteAvatar: {
    width: 24,
    height: 24,
    borderRadius: 15,
  },
  quotedAuthor: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#1da1f2", // Twitter blue
  },
  quotedMedia: {
    width: "100%",
    height: 200,
    borderRadius: 10,
    marginBottom: 10,
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
    width: "85%",
    height: "85%",
    resizeMode: "contain",
  },
  closeButton: {
    position: "absolute",
    top: 70,
    right: 20,
    zIndex: 1000,
  },
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  modalCloseButton: {
    position: "absolute",
    top: 10,
    right: 20,
  },
  modalView: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 35,
    alignItems: "flex-start",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    position: "absolute",
    bottom: 0,
    left: 0,
    width: "100%",
    height: "40%",
  },
  modalText: {
    marginBottom: 15,
    marginLeft: 5,
    textAlign: "center",
    fontSize: 16,
  },
  boldText: {
    fontWeight: "bold",
    marginBottom: 20,
    fontSize: 30,
  },
});
