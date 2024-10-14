import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import Ionicons from "@expo/vector-icons/Ionicons";

export default function ScoresDetails({ route }) {
  const { eventId, sportName, league } = route.params;
  const navigation = useNavigation();
  const [gameData, setGameData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGameDetails();
  }, []);

  const fetchGameDetails = async () => {
    try {
      const response = await fetch(
        `https://site.api.espn.com/apis/site/v2/sports/${sportName}/${league}/summary?event=${eventId}`
      );
      const data = await response.json();
      setGameData(data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching game details:", error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="white" />
      </View>
    );
  }

  const homeTeam = gameData?.header?.competitions[0]?.competitors[0]?.team;
  const homeLogo =
    gameData?.header?.competitions[0]?.competitors[0]?.team?.logos[1]?.href;
  const awayTeam = gameData?.header?.competitions[0]?.competitors[1]?.team;
  const awayLogo =
    gameData?.header?.competitions[0]?.competitors[1]?.team?.logos[1]?.href;

  return (
    <View style={styles.page}>
      <View style={styles.gameContainer}>
        <View style={styles.teamRow}>
          <View style={styles.teamContainer}>
            <Image source={{ uri: awayLogo }} style={styles.teamLogo} />
            <Text style={styles.teamName}>{awayTeam?.nickname}</Text>
          </View>
          <View style={styles.teamContainer}>
            <Image source={{ uri: homeLogo }} style={styles.teamLogo} />
            <Text style={styles.teamName}>{homeTeam?.nickname}</Text>
          </View>
        </View>
      </View>

      <View style={styles.contentView}>
        <Text style={styles.contentText}>Event ID:</Text>
        <Text style={styles.infoText}>{eventId}</Text>

        <Text style={styles.contentText}>Sport:</Text>
        <Text style={styles.infoText}>{sportName}</Text>

        <Text style={styles.contentText}>League:</Text>
        <Text style={styles.infoText}>{league}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: "black",
  },
  backButton: {
    padding: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "black",
  },
  gameContainer: {
    padding: 10,
    marginHorizontal: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "white",
  },
  teamRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  teamContainer: {
    alignItems: "center",
    flex: 1,
  },
  teamLogo: {
    width: 50,
    height: 50,
    marginBottom: 5,
  },
  teamName: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
    textAlign: "center",
  },
  contentView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  contentText: {
    color: "white",
    fontSize: 18,
    marginBottom: 5,
    marginTop: 15,
  },
  infoText: {
    color: "dodgerblue",
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 15,
  },
});
