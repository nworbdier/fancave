import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  SectionList,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import NavBar from "../components/navBar";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Import the NHL icon at the top of the file
import NHLIcon from "../assets/hockey-puck.png";

const sportsIcons = {
  ncaaf: { icon: "american-football-outline", name: "NCAAF" },
  ncaab: { icon: "basketball-outline", name: "NCAAB" },
  nfl: { icon: "american-football-outline", name: "NFL" },
  mlb: { icon: "baseball-outline", name: "MLB" },
  nhl: { icon: "hockey-puck", name: "NHL" }, // Change this to a string
  nba: { icon: "basketball-outline", name: "NBA" },
  wnba: { icon: "basketball-outline", name: "WNBA" },
  mls: { icon: "football-outline", name: "MLS" },
};

const sportsMappings = {
  ncaaf: { sport: "football", league: "college-football" },
  ncaab: { sport: "basketball", league: "mens-college-basketball" },
  nfl: { sport: "football", league: "nfl" },
  mlb: { sport: "baseball", league: "mlb" },
  nhl: { sport: "hockey", league: "nhl" },
  nba: { sport: "basketball", league: "nba" },
  wnba: { sport: "basketball", league: "wnba" },
  mls: { sport: "soccer", league: "usa.1" },
};

const Scores = () => {
  const [selectedSport, setSelectedSport] = useState("ncaaf");
  const [gameData, setGameData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const loadSelectedSport = async () => {
      try {
        const savedSport = await AsyncStorage.getItem("selectedSport");
        if (savedSport !== null) {
          setSelectedSport(savedSport);
          fetchGameData(savedSport);
        } else {
          fetchGameData("ncaaf");
        }
      } catch (error) {
        console.error("Error loading selected sport:", error);
        fetchGameData("ncaaf");
      }
    };

    loadSelectedSport();
  }, []);

  const handleSelectSport = async (sport) => {
    setSelectedSport(sport);
    fetchGameData(sport);
    try {
      await AsyncStorage.setItem("selectedSport", sport);
    } catch (error) {
      console.error("Error saving selected sport:", error);
    }
  };

  const fetchGameData = async (sport) => {
    setLoading(true);
    try {
      const { sport: sportName, league } = sportsMappings[sport];
      let url = `https://site.api.espn.com/apis/site/v2/sports/${sportName}/${league}/scoreboard`;
      
      // Add groups parameter for college football and basketball
      if (sport === 'ncaaf') {
        url += '?groups=80';
      } else if (sport === 'ncaab') {
        url += '?groups=50';
      }

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const data = await response.json();
      const gameData = data.events.map((event) => {
        const competition = event.competitions[0];
        const date = new Date(event.date);
        return {
          id: event.id,
          HomeTeam: competition.competitors[0].team.shortDisplayName,
          HomeLogo: competition.competitors[0].team.logo,
          HomeScore: competition.competitors[0].score,
          AwayTeam: competition.competitors[1].team.shortDisplayName,
          AwayLogo: competition.competitors[1].team.logo,
          AwayScore: competition.competitors[1].score,
          GameTime: date,
          Status: competition.status.type.name,
          StatusShortDetail: competition.status.type.shortDetail,
          Date: date.toLocaleDateString("en-US", {
            weekday: "short",
            month: "short",
            day: "numeric",
          }),
        };
      });

      // Group games by date
      const groupedGames = gameData.reduce((acc, game) => {
        if (!acc[game.Date]) {
          acc[game.Date] = [];
        }
        acc[game.Date].push(game);
        return acc;
      }, {});

      setGameData(groupedGames);
    } catch (error) {
      console.error("Error in fetchGameData:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchGameData(selectedSport);
  }, [selectedSport]);

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.itemContainer,
        selectedSport === item && styles.selectedItem,
      ]}
      onPress={() => handleSelectSport(item)}
    >
      {item === "nhl" ? (
        <Image source={NHLIcon} style={styles.icon} />
      ) : (
        <Ionicons
          name={sportsIcons[item].icon}
          size={18}
          color="white"
          style={styles.icon}
        />
      )}
      <Text style={styles.itemText}>{sportsIcons[item].name}</Text>
    </TouchableOpacity>
  );

  const renderGameItem = ({ item }) => (
    <View style={styles.gameContainer}>
      <View style={styles.teamContainer}>
        <Image source={{ uri: item.AwayLogo }} style={styles.teamLogo} />
        <Text style={styles.teamName}>{item.AwayTeam}</Text>
        <Text style={styles.score}>{item.AwayScore}</Text>
      </View>
      <View style={styles.gameInfo}>
        <Text style={styles.gameStatus}>
          {item.Status === "STATUS_SCHEDULED"
            ? item.GameTime.toLocaleTimeString("en-US", {
                hour: "numeric",
                minute: "2-digit",
              })
            : item.StatusShortDetail}
        </Text>
      </View>
      <View style={styles.teamContainer}>
        <Image source={{ uri: item.HomeLogo }} style={styles.teamLogo} />
        <Text style={styles.teamName}>{item.HomeTeam}</Text>
        <Text style={styles.score}>{item.HomeScore}</Text>
      </View>
    </View>
  );

  const renderDateHeader = ({ section: { title } }) => (
    <View style={styles.dateHeader}>
      <Text style={styles.dateHeaderText}>{title}</Text>
    </View>
  );

  return (
    <View style={styles.page}>
      <SafeAreaView />
      <View style={styles.sportCarousel}>
        <FlatList
          data={Object.keys(sportsIcons)}
          renderItem={renderItem}
          keyExtractor={(item) => item}
          horizontal
          showsHorizontalScrollIndicator={false}
        />
      </View>

      <View style={styles.contentView}>
        {selectedSport ? (
          loading && !refreshing ? (
            <ActivityIndicator size="large" color="white" />
          ) : (
            <SectionList
              sections={Object.entries(gameData).map(([date, data]) => ({
                title: date,
                data,
              }))}
              renderItem={renderGameItem}
              renderSectionHeader={renderDateHeader}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.gameList}
              style={styles.fullWidth}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={onRefresh}
                  tintColor="white"
                  title="Pull to refresh"
                  titleColor="white"
                />
              }
            />
          )
        ) : (
          <Text style={styles.contentText}>Select a sport to view scores</Text>
        )}
      </View>
      <NavBar />
    </View>
  );
};

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: "black",
  },
  sportCarousel: {
    flexShrink: 1,
    flexGrow: 0,
    flexBasis: "auto",
    paddingHorizontal: 20,
  },
  contentView: {
    flex: 10,
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  fullWidth: {
    width: "100%",
  },
  contentText: {
    color: "white",
    fontSize: 18,
  },
  itemContainer: {
    flexDirection: "row",
    padding: 10,
    alignItems: "center",
    backgroundColor: "black",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "white",
    marginHorizontal: 5,
  },
  selectedItem: {
    backgroundColor: "#333",
  },
  itemText: {
    color: "white",
    fontSize: 18,
    marginLeft: 10,
  },
  icon: {
    width: 18,
    height: 18,
  },
  gameContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 10,
    marginHorizontal: 10,
    marginVertical: 5,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "white",
  },
  teamContainer: {
    alignItems: "center",
    flex: 1,
  },
  teamLogo: {
    width: 40,
    height: 40,
    marginBottom: 5,
  },
  teamName: {
    color: "white",
    fontSize: 14,
    textAlign: "center",
  },
  score: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 5,
  },
  gameInfo: {
    alignItems: "center",
    flex: 1,
  },
  gameStatus: {
    color: "white",
    fontSize: 12,
  },
  gameList: {
    paddingVertical: 10,
  },
  dateHeader: {
    padding: 10,
    marginHorizontal: 10,
    marginTop: 10,
    borderRadius: 5,
  },
  dateHeaderText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default Scores;
