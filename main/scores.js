import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from "react";
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
import { TextInput } from "react-native";

// Import the NHL icon at the top of the file
import NHLIcon from "../assets/hockey-puck.png";

// Replace the existing sportsIcons and sportsMappings with this consolidated object
const sportsData = {
  nfl: {
    icon: "american-football-outline",
    name: "NFL",
    sport: "football",
    league: "nfl",
  },
  ncaaf: {
    icon: "american-football-outline",
    name: "NCAAF",
    sport: "football",
    league: "college-football",
  },
  ncaab: {
    icon: "basketball-outline",
    name: "NCAAB",
    sport: "basketball",
    league: "mens-college-basketball",
  },
  mlb: {
    icon: "baseball-outline",
    name: "MLB",
    sport: "baseball",
    league: "mlb",
  },
  nhl: {
    icon: "hockey-puck",
    name: "NHL",
    sport: "hockey",
    league: "nhl",
  },
  nba: {
    icon: "basketball-outline",
    name: "NBA",
    sport: "basketball",
    league: "nba",
  },
  wnba: {
    icon: "basketball-outline",
    name: "WNBA",
    sport: "basketball",
    league: "wnba",
  },
  mls: {
    icon: "football-outline",
    name: "MLS",
    sport: "soccer",
    league: "usa.1",
  },
};

const SearchBox = ({ value, onChangeText }) => (
  <TextInput
    style={styles.searchBox}
    placeholder="Search matchups..."
    placeholderTextColor="#999"
    value={value}
    onChangeText={onChangeText}
  />
);

// Define a constant for the offset
const OFFSET = 1; // Adjust this value as needed

const Scores = () => {
  const [selectedSport, setSelectedSport] = useState("ncaaf");
  const [gameData, setGameData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [dates, setDates] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [dateListLoading, setDateListLoading] = useState(true);
  const dateListRef = useRef(null);
  const [dateListWidth, setDateListWidth] = useState(0);

  useEffect(() => {
    const loadSelectedSport = async () => {
      try {
        const savedSport = await AsyncStorage.getItem("selectedSport");
        if (savedSport !== null) {
          setSelectedSport(savedSport);
          await handleSelectSport(savedSport); // Simulate sport switch
          // console.log("Loaded sport:", savedSport); // Log the sport loaded
        } else {
          await handleSelectSport("ncaaf"); // Simulate sport switch for default
        }
      } catch (error) {
        console.error("Error loading selected sport:", error);
        await handleSelectSport("ncaaf"); // Simulate sport switch for default
      }
    };

    loadSelectedSport();
  }, []);

  useEffect(() => {
    if (selectedDate) {
      // console.log("Selected date:", selectedDate); // Log the selected date after it has been set
      fetchGameData(selectedSport, selectedDate);

      // Scroll to the date if needed
      const newIndex = dates.findIndex((date) => date === selectedDate);
      if (newIndex !== -1) {
        scrollToDate(newIndex);
      }
    }
  }, [selectedDate, selectedSport, dates]); // Add dates to the dependency array

  const fetchDates = async (sport) => {
    setDateListLoading(true);
    try {
      const { sport: sportName, league } = sportsData[sport];
      const response = await fetch(
        `https://sports.core.api.espn.com/v2/sports/${sportName}/leagues/${league}/calendar/whitelist`
      );
      const data = await response.json();
      const dates = data.eventDate.dates;
      const closestDate = findClosestDate(dates);

      // Ensure closestDate is valid before setting it
      if (closestDate) {
        const newIndex = dates.findIndex((date) => date === closestDate);
        setDates(dates);
        setSelectedDate(closestDate); // Set selectedDate to a valid date
        setDateListLoading(false);

        // Scroll to the closest date after the list is rendered
        setTimeout(() => {
          scrollToDate(newIndex);
        }, 100);
      } else {
        console.error("No valid dates found");
        setDateListLoading(false);
      }
    } catch (error) {
      console.error("Error fetching dates:", error);
      setDates([]);
      setDateListLoading(false);
    }
  };

  const handleSelectSport = async (sport) => {
    setSelectedSport(sport);
    await fetchDates(sport);
    // console.log("Switched to sport:", sport); // Log the sport switched
    try {
      await AsyncStorage.setItem("selectedSport", sport);
    } catch (error) {
      console.error("Error saving selected sport:", error);
    }
  };

  const fetchGameData = async (sport, date) => {
    setLoading(true);
    try {
      const { sport: sportName, league } = sportsData[sport];

      // Check if date is defined before proceeding
      if (!date) {
        console.error("Date is undefined");
        return; // Exit the function if date is not defined
      }

      let url = `https://site.api.espn.com/apis/site/v2/sports/${sportName}/${league}/scoreboard?dates=${formatToYYYYMMDD(
        date
      )}`;

      // Add groups parameter for college football and basketball
      if (sport === "ncaaf") {
        url += "&groups=80";
      } else if (sport === "ncaab") {
        url += "&groups=50";
      }

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const data = await response.json();
      const gameData = data.events.map((event) => {
        const competition = event.competitions[0];
        const date = new Date(event.date);
        const isPlayoff =
          competition.series && competition.series.type === "playoff";
        let homeWins = null;
        let awayWins = null;

        if (isPlayoff) {
          homeWins = competition.series.competitors[0].wins;
          awayWins = competition.series.competitors[1].wins;
        }

        const homeRank = competition.competitors[0].curatedRank?.current;
        const awayRank = competition.competitors[1].curatedRank?.current;

        return {
          id: event.id,
          HomeTeam: competition.competitors[0].team.shortDisplayName,
          HomeLogo: competition.competitors[0].team.logo,
          HomeScore: competition.competitors[0].score,
          HomeTeamRecordSummary: isPlayoff
            ? `${homeWins}-${awayWins}`
            : competition.competitors[0].records?.[0]?.summary || "N/A",
          HomeRank: homeRank && homeRank !== 99 ? homeRank : null,
          AwayTeam: competition.competitors[1].team.shortDisplayName,
          AwayLogo: competition.competitors[1].team.logo,
          AwayScore: competition.competitors[1].score,
          AwayTeamRecordSummary: isPlayoff
            ? `${awayWins}-${homeWins}`
            : competition.competitors[1].records?.[0]?.summary || "N/A",
          AwayRank: awayRank && awayRank !== 99 ? awayRank : null,
          GameTime: date,
          Status: competition.status.type.name,
          StatusShortDetail: competition.status.type.shortDetail,
          Date: date.toLocaleDateString("en-US", {
            weekday: "short",
            month: "short",
            day: "numeric",
          }),
          IsPlayoff: isPlayoff,
          HomeWinner: competition.competitors[0].winner,
          AwayWinner: competition.competitors[1].winner,
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
    // Check if selectedDate is defined before fetching game data
    if (selectedDate) {
      fetchGameData(selectedSport, selectedDate);
    } else {
      console.error("selectedDate is undefined during refresh");
      setRefreshing(false); // Stop refreshing if no date is set
    }
  }, [selectedSport, selectedDate]);

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
          name={sportsData[item].icon}
          size={18}
          color="white"
          style={styles.icon}
        />
      )}
      <Text style={styles.itemText}>{sportsData[item].name}</Text>
    </TouchableOpacity>
  );

  const renderGameItem = ({ item }) => (
    <View style={styles.gameContainer}>
      <View style={styles.teamContainer}>
        <Image source={{ uri: item.AwayLogo }} style={styles.teamLogo} />
        <Text
          style={[
            styles.teamName,
            item.Status === "STATUS_FINAL"
              ? item.AwayWinner
                ? styles.winnerText
                : styles.loserText
              : null,
          ]}
        >
          {item.AwayTeam}
          {item.AwayRank && ` (${item.AwayRank})`}
        </Text>
        <Text
          style={[
            styles.recordScore,
            item.Status === "STATUS_FINAL"
              ? item.AwayWinner
                ? styles.winnerText
                : styles.loserText
              : null,
          ]}
        >
          {item.Status === "STATUS_SCHEDULED"
            ? (item.AwayTeamRecordSummary !== "N/A" &&
                item.AwayTeamRecordSummary) ||
              ""
            : item.AwayScore}
        </Text>
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
        <Text
          style={[
            styles.teamName,
            item.Status === "STATUS_FINAL"
              ? item.HomeWinner
                ? styles.winnerText
                : styles.loserText
              : null,
          ]}
        >
          {item.HomeTeam}
          {item.HomeRank && ` (${item.HomeRank})`}
        </Text>
        <Text
          style={[
            styles.recordScore,
            item.Status === "STATUS_FINAL"
              ? item.HomeWinner
                ? styles.winnerText
                : styles.loserText
              : null,
          ]}
        >
          {item.Status === "STATUS_SCHEDULED"
            ? (item.HomeTeamRecordSummary !== "N/A" &&
                item.HomeTeamRecordSummary) ||
              ""
            : item.HomeScore}
        </Text>
      </View>
    </View>
  );

  const handleSearchChange = useCallback((text) => {
    setSearchTerm(text);
  }, []);

  const filteredGames = useMemo(() => {
    if (!searchTerm) return gameData;
    const filtered = {};
    Object.entries(gameData).forEach(([date, gamesForDate]) => {
      const filteredGamesForDate = gamesForDate.filter(
        (game) =>
          game.HomeTeam.toLowerCase().includes(searchTerm.toLowerCase()) ||
          game.AwayTeam.toLowerCase().includes(searchTerm.toLowerCase())
      );
      if (filteredGamesForDate.length > 0) {
        filtered[date] = filteredGamesForDate;
      }
    });
    return filtered;
  }, [gameData, searchTerm]);

  const scrollToDate = (index) => {
    if (dateListRef.current && dates.length > 0) {
      const itemWidth = 86; // 80px width + 6px for margins
      const offset = index * itemWidth - dateListWidth / 2 + itemWidth / 2; // Center the item
      dateListRef.current.scrollToOffset({
        offset: Math.max(0, offset),
        animated: true,
      });
    }
  };

  const handleDateLayout = (event) => {
    const { width } = event.nativeEvent.layout;
    setDateListWidth(width);
  };

  const renderDateItem = ({ item, index }) => (
    <TouchableOpacity
      style={[
        styles.dateItem,
        selectedDate === item && styles.selectedDateItem,
      ]}
      onPress={() => {
        setSelectedDate(item);
        // console.log("Selected Date:", item); // Log the selected date
        scrollToDate(index);
      }}
    >
      <Text
        style={[
          styles.dateText,
          selectedDate === item && styles.selectedDateText,
        ]}
      >
        {formatDate(item)}
      </Text>
    </TouchableOpacity>
  );

  // Calculate the initial scroll index
  const initialScrollIndex = dates.indexOf(selectedDate);
  const centeredScrollIndex =
    initialScrollIndex !== -1 ? initialScrollIndex : 0;

  // Adjust the initial scroll index to center it
  const adjustedScrollIndex = Math.max(0, centeredScrollIndex); // No need for OFFSET here

  return (
    <View style={styles.page}>
      <SafeAreaView />
      <View style={styles.sportCarousel}>
        <FlatList
          data={Object.keys(sportsData)}
          renderItem={renderItem}
          keyExtractor={(item) => item}
          horizontal
          showsHorizontalScrollIndicator={false}
        />
      </View>

      {dateListLoading ? (
        <ActivityIndicator size="small" color="white" />
      ) : (
        <FlatList
          ref={dateListRef}
          data={dates}
          renderItem={renderDateItem}
          keyExtractor={(item) => item}
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.dateCarousel}
          onLayout={handleDateLayout}
          viewPosition={0.5}
          initialScrollIndex={adjustedScrollIndex} // Use the adjusted index
          getItemLayout={(data, index) => ({
            length: dateListWidth / 5,
            offset: (dateListWidth / 5) * index,
            index,
          })}
        />
      )}

      <View style={styles.contentView}>
        <SearchBox value={searchTerm} onChangeText={handleSearchChange} />
        <View style={styles.scoresContainer}>
          {selectedSport ? (
            loading && !refreshing ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="white" />
              </View>
            ) : (
              <SectionList
                sections={Object.entries(filteredGames).map(([date, data]) => ({
                  title: date,
                  data,
                }))}
                renderItem={renderGameItem}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.gameList}
                style={styles.fullWidth}
                refreshControl={
                  <RefreshControl
                    refreshing={refreshing}
                    onRefresh={onRefresh}
                    tintColor="white"
                    titleColor="white"
                  />
                }
                stickySectionHeadersEnabled={false} // Add this line
              />
            )
          ) : (
            <Text style={styles.contentText}>
              Select a sport to view scores
            </Text>
          )}
        </View>
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
    fontWeight: "bold",
    fontSize: 18,
    marginLeft: 10,
  },
  icon: {
    width: 18,
    height: 18,
  },
  gameList: {
    paddingVertical: 5,
  },
  gameContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#222222",
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
    width: 50,
    height: 50,
    marginBottom: 5,
  },
  teamName: {
    color: "white",
    fontWeight: "bold",
    fontSize: 14,
    textAlign: "center",
  },
  recordScore: {
    color: "white",
    fontWeight: "bold",
    fontSize: 20,
    marginTop: 5,
  },
  gameInfo: {
    alignItems: "center",
    flex: 1,
  },
  gameStatus: {
    color: "white",
    fontSize: 16,
  },
  searchBox: {
    flexShrink: 1,
    width: "90%",
    height: 40,
    color: "white",
    paddingHorizontal: 10,
    marginVertical: 10,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: "white",
  },
  scoresContainer: {
    flex: 10,
    width: "100%",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  dateCarousel: {
    flexShrink: 1,
    flexGrow: 0,
    flexBasis: "auto",
    paddingHorizontal: 10,
    height: 30, // Reduced height
    marginTop: 10,
  },
  dateItem: {
    padding: 5,
    marginHorizontal: 3,
    width: 80, // Fixed width instead of percentage
    justifyContent: "center",
    alignItems: "center",
  },
  dateText: {
    color: "white",
    fontSize: 16, // Slightly smaller font
    textAlign: "center",
    fontWeight: "bold",
  },
  selectedDateText: {
    color: "yellow", // Add this new style for selected date text
  },
  winnerText: {
    fontWeight: "bold",
    color: "white",
  },
  loserText: {
    fontWeight: "normal",
    color: "#999", // A lighter grey color
  },
});

// Helper functions
const formatToYYYYMMDD = (dateString) => {
  return dateString.split("T")[0].replace(/-/g, "");
};

const findClosestDate = (dates) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Set time to midnight for accurate comparison

  // First, check if today's date is in the list
  const todayString = today.toISOString().split("T")[0];
  if (dates.includes(todayString)) {
    return todayString;
  }

  // If today's date is not in the list, find the next closest date
  return dates.reduce((closest, date) => {
    const currentDate = new Date(date);
    const closestDate = new Date(closest);

    if (
      currentDate >= today &&
      (currentDate < closestDate || closestDate < today)
    ) {
      return date;
    }
    return closest;
  });
};

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date
    .toLocaleDateString("en-US", { month: "short", day: "numeric" })
    .replace(",", "");
};

export default Scores;
