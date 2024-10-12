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

const Feed = () => {
  const navigation = useNavigation();
  const [tweets, setTweets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedTeam, setSelectedTeam] = useState(
    "Purdue Boilermaker Football"
  );
  const [modalVisible, setModalVisible] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const listDictionary = {
    "": "All Feeds",
    "1777306887953805810": "Purdue Boilermaker Football",
    "1777402248013771060": "Iowa Hawkeyes",
    "1778436010977747315": "Indianapolis Colts",
  };

  const fetchNewsArticles = async () => {
    const query = selectedTeam; // Use selected team or default query
    const url = `https://real-time-news-data.p.rapidapi.com/search?query=${query}&limit=25&time_published=7d&country=US&lang=en`; // Removed encodeURIComponent

    const options = {
      method: "GET",
      headers: {
        "x-rapidapi-key": process.env.EXPO_PUBLIC_RAPID_API_NEWS_KEY,
        "x-rapidapi-host": process.env.EXPO_PUBLIC_RAPID_API_NEWS_HOST,
      },
    };

    try {
      const response = await fetch(url, options);
      const data = await response.json();

      const extractedArticles = (data.data || []).map((article) => ({
        text: article.snippet ?? "", // Use title as text
        created_at: article.published_datetime_utc ?? "", // Use published date
        media: article.photo_url ?? "", // Use photo_url for media
        author: {
          screen_name: article.source_name ?? "", // Use source_name as author
          avatar: article.source_favicon_url ?? "", // Use source_favicon_url for avatar
        },
      }));

      // Sort articles by created_at date
      extractedArticles.sort(
        (a, b) => new Date(b.created_at) - new Date(a.created_at)
      );

      setTweets(extractedArticles); // Update tweets with articles
      setHasMore(extractedArticles.length === TWEETS_PER_PAGE);
    } catch (error) {
      console.error("Error fetching news articles:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchNewsArticles(); // Call the new function
  }, [selectedTeam]);

  const debouncedRefresh = useCallback(
    debounce(() => {
      setPage(1);
      setHasMore(true);
      fetchNewsArticles(1, true);
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
      fetchNewsArticles(page + 1);
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
          <ActivityIndicator size="large" color="grey" />
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
      <NavBar />

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
};

const styles = StyleSheet.create({
  app: {
    flex: 1,
    backgroundColor: "black",
    paddingTop: 10,
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
    flex: 10.5,
  },
  loadingContainer: {
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

export default Feed;
