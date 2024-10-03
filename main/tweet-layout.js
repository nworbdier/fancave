import React from "react";
import { StyleSheet, View, Image, Text, TouchableOpacity } from "react-native";
import moment from "moment";
import { decode } from "html-entities";
import { Ionicons } from "@expo/vector-icons"; // Make sure to install this package

const TweetLayout = ({ item, onImagePress }) => {
  const formattedDate = moment(item.created_at, "ddd MMM DD HH:mm:ss ZZ YYYY")
    .locale("en")
    .format("MMM D");

  return (
    <View style={styles.tweetContainer}>
      <View style={styles.tweetHeader}>
        <Image source={{ uri: item.author.avatar }} style={styles.avatar} />
        <View style={styles.tweetHeaderText}>
          <Text style={styles.authorName}>{item.author.name}</Text>
          <Text style={styles.authorUsername}>@{item.author.screen_name}</Text>
        </View>
        <Text style={styles.date}>{formattedDate}</Text>
      </View>
      <Text style={styles.tweetText}>{decode(item.text)}</Text>
      {item.media && (
        <TouchableOpacity onPress={() => onImagePress(item.media)}>
          <Image source={{ uri: item.media }} style={styles.tweetImage} />
        </TouchableOpacity>
      )}
      <View style={styles.tweetActions}>
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="chatbubble-outline" size={18} color="#8899a6" />
          <Text style={styles.actionText}>Comment</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="repeat-outline" size={18} color="#8899a6" />
          <Text style={styles.actionText}>Retweet</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="heart-outline" size={18} color="#8899a6" />
          <Text style={styles.actionText}>Like</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  tweetContainer: {
    backgroundColor: "#000000",
    borderBottomWidth: 1,
    borderBottomColor: "#2f3336",
    padding: 15,
  },
  tweetHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 10,
  },
  tweetHeaderText: {
    flex: 1,
  },
  authorName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#ffffff",
  },
  authorUsername: {
    fontSize: 14,
    color: "#8899a6",
  },
  date: {
    fontSize: 14,
    color: "#8899a6",
  },
  tweetText: {
    fontSize: 16,
    color: "#ffffff",
    marginBottom: 10,
    lineHeight: 22,
  },
  tweetImage: {
    width: "100%",
    aspectRatio: 16 / 9,
    borderRadius: 15,
    marginBottom: 10,
  },
  tweetActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  actionText: {
    marginLeft: 5,
    fontSize: 14,
    color: "#8899a6",
  },
});

export default TweetLayout;
