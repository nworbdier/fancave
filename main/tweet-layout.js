import React from "react";
import { StyleSheet, View, Image, Text, TouchableOpacity } from "react-native";
import moment from "moment";
import { decode } from "html-entities";

const TweetLayout = ({ item, onImagePress }) => {
  const formattedDate = moment(item.created_at, "ddd MMM DD HH:mm:ss ZZ YYYY")
    .locale("en")
    .format("h:mm A");

  return (
    <View style={styles.tweetContainer}>
      <View style={styles.tweetHeader}>
        <Image source={{ uri: item.author.avatar }} style={styles.avatar} />
        <View style={styles.tweetHeaderText}>
          <Text style={styles.author}>@{item.author.screen_name}</Text>
          <Text style={styles.date}>{formattedDate}</Text>
        </View>
      </View>
      <Text style={styles.tweetText}>{decode(item.text)}</Text>
      {item.media && (
        <TouchableOpacity onPress={() => onImagePress(item.media)}>
          <Image source={{ uri: item.media }} style={styles.tweetImage} />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  tweetContainer: {
    borderWidth: 1,
    borderColor: "lightgrey",
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    marginHorizontal: 15,
  },
  tweetHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  tweetHeaderText: {
    flexDirection: "column",
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  tweetImage: {
    width: "100%",
    resizeMode: "contain",
    height: 200,
    marginTop: 15,
    borderRadius: 10,
  },
  author: {
    fontSize: 14,
    fontWeight: "bold",
    color: "lightgrey",
  },
  date: {
    fontSize: 12,
    color: "lightgrey",
    marginLeft: 10,
  },
  tweetText: {
    color: "lightgrey",
    fontSize: 15,
  },
});

export default TweetLayout;
