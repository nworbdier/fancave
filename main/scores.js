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
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  SectionList,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import { useNavigation } from "@react-navigation/native";
import { useSportsContext } from "./SportsContext";
import { Entypo } from "@expo/vector-icons";
import SearchBox from "../components/searchbox";
import renderBasesComponent from "../components/bases";
import ScoreboardGame from "../components/scoreboard";

export default function Scores({ route }) {
  const { sportsData } = useSportsContext();
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
  const sportListRef = useRef(null); // Create a ref for the FlatList
  const navigation = useNavigation();

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

  useFocusEffect(
    useCallback(() => {
      const interval = setInterval(() => {
        if (selectedDate) {
          // Ensure selectedDate is defined
          fetchGameData(selectedSport, selectedDate);
        }
      }, 2000); // Refresh every 2 seconds

      return () => clearInterval(interval); // Clear the interval on unmount
    }, [selectedSport, selectedDate]) // Dependencies to ensure it uses the latest values
  );

  useFocusEffect(
    useCallback(() => {
      // This function will be called when the screen comes into focus
      const refreshOnFocus = async () => {
        if (selectedDate) {
          await fetchGameData(selectedSport, selectedDate);
        }
      };

      refreshOnFocus();

      // Return a cleanup function if needed
      return () => {
        // Any cleanup code (if necessary)
      };
    }, [selectedSport, selectedDate, fetchGameData])
  );

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
    // Scroll to the selected sport
    const index = Object.keys(sportsData).indexOf(sport);
    if (sportListRef.current && index !== -1) {
      sportListRef.current.scrollToIndex({
        index,
        animated: true,
        viewPosition: 0.5,
      });
    }
    try {
      await AsyncStorage.setItem("selectedSport", sport);
    } catch (error) {
      console.error("Error saving selected sport:", error);
    }
  };

  const fetchGameData = useCallback(async (sport, date) => {
    try {
      const { sport: sportName, league } = sportsData[sport];

      // Check if date is defined before proceeding
      if (!date) {
        console.error("Date is undefined");
        return; // Exit the function if date is not defined
      }

      // Log the sport to ensure it's correct
      // console.log("Selected sport:", sport);

      let url = `https://site.api.espn.com/apis/site/v2/sports/${sportName}/${league}/scoreboard?dates=${formatToYYYYMMDD(
        date
      )}`;

      // Add groups parameter for college football and basketball
      if (sport === "college-football") {
        url += "&groups=80";
      } else if (sport === "mens-college-basketball") {
        url += "&groups=50";
      }

      // Log the final URL
      // console.log("Final URL with groups:", url);

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const data = await response.json();
      const gameData = data.events
        .map((event) => {
          const homeTeam = event.competitions[0].competitors[0];
          const awayTeam = event.competitions[0].competitors[1];

          const homeLogo = homeTeam.team.logo;
          const awayLogo = awayTeam.team.logo;

          // Set dark logos only if the original logos exist
          const homeLogoDark = homeLogo
            ? homeLogo.replace("/500/", "/500-dark/")
            : "";
          const awayLogoDark = awayLogo
            ? awayLogo.replace("/500/", "/500-dark/")
            : "";

          // Check if both logos exist
          if (!homeLogo || !awayLogo) {
            return null; // Filter out events without logos
          }

          const competition = event.competitions[0];
          const date = new Date(event.date);
          const isPlayoff =
            competition.series && competition.series.type === "playoff";
          let homeWins = null;
          let awayWins = null;
          let homeSeriesRecord = null;
          let awaySeriesRecord = null;

          if (isPlayoff) {
            homeWins = competition.series.competitors[0].wins;
            awayWins = competition.series.competitors[1].wins;
            homeSeriesRecord = `${homeWins}-${awayWins}`;
            awaySeriesRecord = `${awayWins}-${homeWins}`;
          }

          const homeRank = competition.competitors[0].curatedRank?.current;
          const awayRank = competition.competitors[1].curatedRank?.current;

          // Add possession information
          const possession = competition.situation?.possession;
          const homePossession = possession === competition.competitors[0].id;
          const awayPossession = possession === competition.competitors[1].id;

          return {
            id: event.id,
            HomeTeam: competition.competitors[0].team.shortDisplayName,
            HomeAbbrev: competition.competitors[0].team.abbreviation,
            HomeLookup: competition.competitors[0].team.displayName,
            HomeLogo: homeLogo, // Original logo
            HomeLogoDark: homeLogoDark, // Dark logo or empty string
            HomeScore: competition.competitors[0].score,
            HomeTeamRecordSummary: isPlayoff
              ? homeSeriesRecord
              : formatHockeyRecord(
                  competition.competitors[0].records?.[0]?.summary || "N/A",
                  isPlayoff,
                  sportName
                ),
            HomeRank: homeRank && homeRank !== 99 ? homeRank : null,
            AwayTeam: competition.competitors[1].team.shortDisplayName,
            AwayAbbrev: competition.competitors[1].team.abbreviation,
            AwayLookup: competition.competitors[1].team.displayName,
            AwayLogo: awayLogo, // Original logo
            AwayLogoDark: awayLogoDark, // Dark logo or empty string
            AwayScore: competition.competitors[1].score,
            AwayTeamRecordSummary: isPlayoff
              ? awaySeriesRecord
              : formatHockeyRecord(
                  competition.competitors[1].records?.[0]?.summary || "N/A",
                  isPlayoff,
                  sportName
                ),
            AwayRank: awayRank && awayRank !== 99 ? awayRank : null,
            GameTime: date.toLocaleTimeString("en-US", {
              hour: "numeric",
              minute: "2-digit",
              hour12: true,
            }), // Format the game time
            Status: competition.status.type.name,
            StatusShortDetail: competition.status.type.shortDetail,
            displayClock: competition.status.displayClock || null,
            period: competition.status.period || null,
            Date: date.toLocaleDateString("en-US", {
              weekday: "short",
              month: "short",
              day: "numeric",
            }),
            Inning: competition.status.period || null,
            Outs: competition.situation ? competition.situation.outs : null,
            First: competition.situation ? competition.situation.onFirst : null,
            Second: competition.situation
              ? competition.situation.onSecond
              : null,
            Third: competition.situation ? competition.situation.onThird : null,
            IsPlayoff: isPlayoff,
            HomeWins: homeWins,
            AwayWins: awayWins,
            HomeWinner: competition.competitors[0].winner,
            AwayWinner: competition.competitors[1].winner,
            HomePossession: homePossession,
            AwayPossession: awayPossession,
            isRedZone: competition.situation?.isRedZone,
            sport: sportName,
            shortDownDistanceText:
              competition.situation?.shortDownDistanceText || null,
            possessionText: competition.situation?.possessionText || null,
          };
        })
        .filter((event) => event !== null); // Filter out null events

      // Sort games: put STATUS_IN_PROGRESS first, STATUS_SCHEDULED second, and STATUS_FINAL last
      const sortedGames = gameData.sort((a, b) => {
        const statusOrder = {
          STATUS_IN_PROGRESS: 1,
          STATUS_DELAYED: 1,
          STATUS_HALFTIME: 1,
          STATUS_SCHEDULED: 2,
          STATUS_FINAL: 3,
          STATUS_POSTPONED: 3,
          STATUS_CANCELED: 3,
        };
        const statusComparison = statusOrder[a.Status] - statusOrder[b.Status];
        if (statusComparison !== 0) {
          return statusComparison; // Sort by status first
        }
        return new Date(a.GameTime) - new Date(b.GameTime); // Sort by GameTime if statuses are the same
      });

      // Group games by date
      const groupedGames = sortedGames.reduce((acc, game) => {
        if (!acc[game.Date]) {
          acc[game.Date] = [];
        }
        acc[game.Date].push(game);
        return acc;
      }, {});

      setGameData(groupedGames);
    } catch (error) {
      console.error("Error in fetchGameData:", error);
    }
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    // Check if selectedDate is defined before fetching game data
    if (selectedDate) {
      fetchGameData(selectedSport, selectedDate).finally(() => {
        setRefreshing(false); // Stop refreshing after data is fetched
      });
    } else {
      console.error("selectedDate is undefined during refresh");
      setRefreshing(false); // Stop refreshing if no date is set
    }
  }, [selectedSport, selectedDate]);

  const sportSelector = ({ item }) => {
    if (item === "reorderSports") {
      return (
        <TouchableOpacity
          style={styles.itemContainer}
          onPress={() => navigation.navigate("ReorderSports")}
        >
          <Entypo name="dots-three-horizontal" size={24} color="white" />
        </TouchableOpacity>
      );
    }
    return (
      <TouchableOpacity
        style={[
          styles.itemContainer,
          selectedSport === item && styles.selectedItem,
        ]}
        onPress={() => handleSelectSport(item)}
      >
        <Text
          style={[
            styles.itemText,
            selectedSport === item && styles.selectedText,
          ]}
        >
          {sportsData[item].name}
        </Text>
      </TouchableOpacity>
    );
  };

  const matchupView = ({ item }) => (
    <ScoreboardGame
      item={item}
      onPress={() =>
        navigation.navigate("ScoresDetails", {
          eventId: item.id,
          sportName: item.sport,
          league: sportsData[selectedSport].league,
        })
      }
    />
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
          game.AwayTeam.toLowerCase().includes(searchTerm.toLowerCase()) ||
          game.HomeLookup.toLowerCase().includes(searchTerm.toLowerCase()) || // Added filtering by HomeLookup
          game.AwayLookup.toLowerCase().includes(searchTerm.toLowerCase()) // Added filtering by AwayLookup
      );
      if (filteredGamesForDate.length > 0) {
        filtered[date] = filteredGamesForDate;
      }
    });
    return filtered;
  }, [gameData, searchTerm]);

  const scrollToDate = (index) => {
    if (dateListRef.current && dates.length > 0) {
      const itemWidth = 70; // 68px width + 2px for margins (1px on each side)
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

  const dateSelector = ({ item, index }) => (
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
      <View style={styles.sportCarouselContainer}>
        <FlatList
          ref={sportListRef}
          data={[...Object.keys(sportsData), "reorderSports"]}
          renderItem={sportSelector}
          keyExtractor={(item) => item}
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.sportCarousel}
        />
      </View>

      {dateListLoading ? (
        <ActivityIndicator size="small" color="white" />
      ) : (
        <FlatList
          ref={dateListRef}
          data={dates}
          renderItem={dateSelector}
          keyExtractor={(item) => item}
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.dateCarousel}
          onLayout={handleDateLayout}
          viewPosition={0.5}
          initialScrollIndex={adjustedScrollIndex}
          getItemLayout={(data, index) => ({
            length: 70, // Match the new itemWidth (68px + 2px margins)
            offset: 70 * index,
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
                <ActivityIndicator color="white" />
              </View>
            ) : (
              <SectionList
                sections={Object.entries(filteredGames).map(([date, data]) => ({
                  title: date,
                  data,
                }))}
                renderItem={matchupView}
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
                stickySectionHeadersEnabled={false}
              />
            )
          ) : (
            <Text style={styles.contentText}>
              Select a sport to view scores
            </Text>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: "black",
  },
  sportCarouselContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 5,
  },
  contentView: {
    flex: 1,

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
    justifyContent: "center",
    minWidth: 40,
  },
  itemText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 20,
    marginLeft: 4,
  },
  selectedText: {
    color: "dodgerblue",
  },
  selectedIcon: {
    width: 24,
    height: 24,
  },
  icon: {
    width: 24,
    height: 24,
  },
  gameList: {
    paddingVertical: 5,
  },
  gameContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    marginVertical: 5,
    marginHorizontal: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "white",
  },
  teamRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-evenly",
    flex: 1,
  },
  teamInfoContainer: {
    alignItems: "center",
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
  scoreContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  recordScore: {
    color: "white",
    fontWeight: "bold",
    fontSize: 20,
  },
  possessionIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "yellow",
    marginHorizontal: 10,
  },
  redPossessionIndicator: {
    backgroundColor: "red",
  },
  gameInfo: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
  },
  gameStatus: {
    color: "white",
    fontSize: 16,
    textAlign: "center",
  },
  downDistance: {
    color: "white",
    fontSize: 14,
    textAlign: "center",
    marginTop: 4,
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
    paddingHorizontal: 5,
    height: 30,
    marginTop: 2,
    marginBottom: 2,
  },
  dateItem: {
    padding: 4,
    marginHorizontal: 1,
    width: 68,
    justifyContent: "center",
    alignItems: "center",
  },
  dateText: {
    color: "white",
    fontSize: 15,
    textAlign: "center",
    fontWeight: "bold",
  },
  selectedDateText: {
    color: "dodgerblue",
  },
  winnerText: {
    fontWeight: "bold",
    color: "white",
  },
  loserText: {
    fontWeight: "bold",
    color: "white",
    opacity: 0.5, // Add opacity to create a "greyed out" effect
  },
  situationContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  situationText: {
    color: "white",
    fontSize: 15,
    textAlign: "center",
    marginTop: 3,
  },
  emptySpace: {
    width: 15,
    height: 15,
    transform: [{ rotate: "45deg" }],
  },
  recordText: {
    color: "white",
    fontSize: 20,
    fontWeight: "normal",
  },
  scoreText: {
    color: "white",
    fontSize: 24,
    fontWeight: "bold",
  },
  loserLogo: {
    opacity: 0.5,
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

// Update the getOrdinal function
const getOrdinal = (period) => {
  if (period === 1) return "1st";
  if (period === 2) return "2nd";
  if (period === 3) return "3rd";
  if (period === 4) return "4th";
  if (period === 5) return "OT";
  if (period > 5) return `${period - 4}OT`;
};

// New helper function to format hockey and soccer records
const formatHockeyRecord = (record, isPlayoff, sport) => {
  if (isPlayoff) return record; // Keep playoff records as is
  // Check if the sport is hockey or soccer
  if (sport === "hockey" || sport === "soccer") {
    return record.endsWith("-0") ? record.slice(0, -2) : record; // Trim off -0 if present
  }
  return record; // Return the record unchanged for other sports
};
