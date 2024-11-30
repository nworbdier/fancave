import React, { useState, useEffect, useCallback } from "react";
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
  RefreshControl,
  StatusBar,
  Touchable,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import NavBar from "../components/navBar";
import {
  FontAwesome6,
  AntDesign,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import debounce from "lodash.debounce";
import TweetLayout from "./tweet-layout";

const CACHE_KEY_PREFIX = "CACHED_TWEETS_";
const CACHE_EXPIRATION = 5 * 60 * 1000; // 5 minutes
const TWEETS_PER_PAGE = 20;

export default function App() {
  const navigation = useNavigation();
  const [tweets, setTweets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedTeam, setSelectedTeam] = useState("Purdue Boilermakers");
  const [modalVisible, setModalVisible] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const listDictionary = {
    "": "All Feeds",
    "1777306887953805810": "Purdue Boilermakers",
    "1777402248013771060": "Iowa Hawkeyes",
    "1778436010977747315": "Indianapolis Colts",
  };

  useEffect(() => {
    fetchTwitterListTimeline(1, true);
  }, [selectedTeam]);

  const fetchTwitterListTimeline = async (
    pageToFetch = 1,
    isNewTeam = false
  ) => {
    const listId = Object.keys(listDictionary).find(
      (key) => listDictionary[key] === selectedTeam
    );
    if (!listId) return;

    const cacheKey = `${CACHE_KEY_PREFIX}${selectedTeam}`;

    try {
      // Check cache first
      if (pageToFetch === 1) {
        const cachedData = await AsyncStorage.getItem(cacheKey);
        if (cachedData) {
          const { tweets: cachedTweets, timestamp } = JSON.parse(cachedData);
          if (Date.now() - timestamp < CACHE_EXPIRATION) {
            setTweets(cachedTweets);
            setLoading(false);
            return;
          }
        }
      }

      const url = `https://twitter-api45.p.rapidapi.com/listtimeline.php?list_id=${listId}`; // Updated URL with listId
      const options = {
        method: "GET",
        headers: {
          "x-rapidapi-key": process.env.EXPO_PUBLIC_RAPID_API_KEY,
          "x-rapidapi-host": "twitter-api45.p.rapidapi.com",
        },
      };

      const response = await fetch(url, options);
      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);

      const data = await response.json();
      const extractedTweets = (data.timeline || []).map((tweet) => ({
        text: tweet.text,
        created_at: tweet.created_at,
        media:
          tweet.media?.video?.[0]?.media_url_https ||
          tweet.media?.photo?.[0]?.media_url_https,
        author: {
          screen_name: tweet.author.screen_name,
          avatar: tweet.author.avatar,
        },
      }));

      if (pageToFetch === 1 || isNewTeam) {
        setTweets(extractedTweets);
        // Cache the new data
        await AsyncStorage.setItem(
          cacheKey,
          JSON.stringify({
            tweets: extractedTweets,
            timestamp: Date.now(),
          })
        );
      } else {
        setTweets((prevTweets) => [...prevTweets, ...extractedTweets]);
      }

      setHasMore(extractedTweets.length === TWEETS_PER_PAGE);
    } catch (error) {
      console.error("Error fetching Twitter list timeline:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const debouncedRefresh = useCallback(
    debounce(() => {
      setPage(1);
      setHasMore(true);
      fetchTwitterListTimeline(1, true);
    }, 300),
    [selectedTeam]
  );

  const onRefresh = async () => {
    setRefreshing(true);
    setLoading(true); // Set loading to true when refreshing starts
    debouncedRefresh();
  };

  const loadMoreTweets = () => {
    if (hasMore && !loading) {
      setPage((prevPage) => prevPage + 1);
      fetchTwitterListTimeline(page + 1);
    }
  };

  const handleTeamChange = (team) => {
    setSelectedTeam(team);
    setModalVisible(false);
    setLoading(true);
    setPage(1);
    setHasMore(true);
  };

  const handleImagePress = (imageUrl) => {
    setSelectedImage(imageUrl);
  };

  const closeFullScreenImage = () => {
    setSelectedImage(null);
  };

  return (
    <View style={styles.app}>
      <StatusBar style="auto" />
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(!modalVisible)}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <View
              style={{
                width: "100%",
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 15,
              }}
            >
              <Text style={styles.boldText}>Feed</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setModalVisible(!modalVisible)}
              >
                <Text style={styles.modalCloseButton}>X</Text>
              </TouchableOpacity>
            </View>

            {Object.values(listDictionary).map((team, index) => (
              <View key={index}>
                <TouchableOpacity
                  onPress={() => handleTeamChange(team)}
                  style={styles.teamItem}
                >
                  <AntDesign
                    name="star"
                    size={18}
                    color="white"
                    style={styles.starIcon}
                  />
                  <Text style={styles.modalText}>{team}</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>
      </Modal>

      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => setModalVisible(true)}
          style={styles.headerLeft}
        >
          <Text style={styles.headerText}>{selectedTeam}</Text>
          <FontAwesome6
            name="chevron-down"
            size={18}
            color="white"
            marginLeft={5}
          />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate("ActivityCenter")}>
          <MaterialCommunityIcons name="bell-outline" size={28} color="white" />
        </TouchableOpacity>
      </View>
      <View style={styles.content}>
        {loading && page === 1 ? (
          <ActivityIndicator size="100" color="grey" />
        ) : (
          <FlatList
            data={tweets}
            renderItem={({ item }) => (
              <TweetLayout item={item} onImagePress={handleImagePress} />
            )}
            keyExtractor={(item, index) => index.toString()}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor="white"
                titleColor="white"
              />
            }
            showsVerticalScrollIndicator={false}
            onEndReached={loadMoreTweets}
            onEndReachedThreshold={0.1}
          />
        )}
      </View>

      {selectedImage && (
        <TouchableOpacity
          style={styles.fullImageContainer}
          activeOpacity={1}
          onPress={closeFullScreenImage}
        >
          <Image
            source={{ uri: selectedImage }}
            style={styles.fullImage}
            resizeMode="contain"
          />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  app: {
    flex: 1,
    backgroundColor: "black",
    paddingTop: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 10,
  },
  headerLeft: {
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
    flex: 1,
  },
  loadingContainer: {
    // Added loading container style
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  fullImageContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 999,
  },
  fullImage: {
    width: "85%",
    height: "85%",
    resizeMode: "contain",
  },
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  closeButton: {
    textAlign: "right",
  },
  modalCloseButton: {
    color: "white",
    fontWeight: "bold",
    fontSize: 24,
  },
  teamItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
  },
  starIcon: {
    marginRight: 10,
  },
  modalView: {
    backgroundColor: "#141414",
    borderRadius: 20,
    padding: 35,
    alignItems: "flex-start",
    position: "absolute",
    bottom: 0,
    left: 0,
    width: "100%",
    height: "87%",
  },
  modalText: {
    marginLeft: 5,
    textAlign: "center",
    fontSize: 18,
    color: "white",
  },
  boldText: {
    fontWeight: "bold",
    fontSize: 24,
    color: "white",
    textAlign: "left",
    flex: 1,
  },
});
