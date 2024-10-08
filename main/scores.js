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
  TextInput,
  PanResponder,
  Animated,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import NavBar from "../components/navBar";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native"; // Add this import

// Define SearchBox component before using it
const SearchBox = ({ value, onChangeText }) => (
  <View style={styles.searchBoxContainer}>
    <TextInput
      style={styles.searchBox}
      placeholder="Search matchups..."
      placeholderTextColor="#999"
      value={value}
      onChangeText={onChangeText}
    />
    {value.length > 0 && ( // Show the clear button only if there is text
      <TouchableOpacity
        onPress={() => onChangeText("")}
        style={styles.clearButton}
      >
        <Ionicons name="close" size={20} color="white" />
      </TouchableOpacity>
    )}
  </View>
);

// Replace the existing sportsIcons and sportsMappings with this consolidated object
export const sportsData = {
  nfl: {
    id: 1,
    icon: "american-football-outline",
    name: "NFL",
    sport: "football",
    league: "nfl",
  },
  ncaaf: {
    id: 2,
    icon: "american-football-outline",
    name: "NCAAF",
    sport: "football",
    league: "college-football",
  },
  mlb: {
    id: 3,
    icon: "baseball-outline",
    name: "MLB",
    sport: "baseball",
    league: "mlb",
  },
  nhl: {
    id: 4,
    icon: "hockey-puck",
    name: "NHL",
    sport: "hockey",
    league: "nhl",
  },
  nba: {
    id: 5,
    icon: "basketball-outline",
    name: "NBA",
    sport: "basketball",
    league: "nba",
  },
  wnba: {
    id: 6,
    icon: "basketball-outline",
    name: "WNBA",
    sport: "basketball",
    league: "wnba",
  },
  ncaab: {
    id: 7,
    icon: "basketball-outline",
    name: "NCAAB",
    sport: "basketball",
    league: "mens-college-basketball",
  },
  mls: {
    id: 8,
    icon: "football-outline",
    name: "MLS",
    sport: "soccer",
    league: "usa.1",
  },
};

// Define a constant for the offset
const OFFSET = 1; // Adjust this value as needed

export default function Scores({ route }) {
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
  const navigation = useNavigation(); // Add this line
  const [sportsOrder, setSportsOrder] = useState(Object.keys(sportsData));

  useEffect(() => {
    const loadSportsOrder = async () => {
      try {
        const savedOrder = await AsyncStorage.getItem("sportsOrder");
        if (savedOrder) {
          setSportsOrder(JSON.parse(savedOrder));
        }
      } catch (error) {
        console.error("Error loading sports order:", error);
      }
    };
    loadSportsOrder();
  }, []);

  useEffect(() => {
    if (route.params?.updatedSportsOrder) {
      setSportsOrder(route.params.updatedSportsOrder);
    }
  }, [route.params?.updatedSportsOrder]);

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

        // Add possession information
        const possession = competition.situation?.possession;
        const homePossession = possession === competition.competitors[0].id;
        const awayPossession = possession === competition.competitors[1].id;

        return {
          id: event.id,
          HomeTeam: competition.competitors[0].team.shortDisplayName,
          HomeLogo: homeLogo, // Original logo
          HomeLogoDark: homeLogoDark, // Dark logo or empty string
          HomeScore: competition.competitors[0].score,
          HomeTeamRecordSummary: isPlayoff
            ? `${homeWins}-${awayWins}`
            : competition.competitors[0].records?.[0]?.summary || "N/A",
          HomeRank: homeRank && homeRank !== 99 ? homeRank : null,
          AwayTeam: competition.competitors[1].team.shortDisplayName,
          AwayLogo: awayLogo, // Original logo
          AwayLogoDark: awayLogoDark, // Dark logo or empty string
          AwayScore: competition.competitors[1].score,
          AwayTeamRecordSummary: isPlayoff
            ? `${awayWins}-${homeWins}`
            : competition.competitors[1].records?.[0]?.summary || "N/A",
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
          Second: competition.situation ? competition.situation.onSecond : null,
          Third: competition.situation ? competition.situation.onThird : null,
          IsPlayoff: isPlayoff,
          HomeWins: homeWins,
          AwayWins: awayWins,
          HomeWinner: competition.competitors[0].winner,
          AwayWinner: competition.competitors[1].winner,
          HomePossession: homePossession,
          AwayPossession: awayPossession,
          sport: sportName,
          shortDownDistanceText:
            competition.situation?.shortDownDistanceText || null,
          possessionText: competition.situation?.possessionText || null,
        };
      });

      // Sort games: put STATUS_IN_PROGRESS first, STATUS_SCHEDULED second, and STATUS_FINAL last
      const sortedGames = gameData.sort((a, b) => {
        const statusOrder = {
          STATUS_IN_PROGRESS: 1,
          STATUS_SCHEDULED: 2,
          STATUS_FINAL: 3,
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
      <Text
        style={[styles.itemText, selectedSport === item && styles.selectedText]}
      >
        {sportsData[item].name}
      </Text>
    </TouchableOpacity>
  );

  const renderReorderButton = () => (
    <TouchableOpacity
      onPress={navigateToReorderSports}
      style={styles.reorderButton}
    >
      <Ionicons name="ellipsis-vertical" size={24} color="white" />
    </TouchableOpacity>
  );

  const renderGameItem = ({ item }) => (
    <View style={styles.gameContainer}>
      <View style={styles.teamRow}>
        <View style={styles.teamContainer}>
          <Image source={{ uri: item.AwayLogoDark }} style={styles.teamLogo} />
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
              : item.Status === "STATUS_POSTPONED" ||
                item.Status === "STATUS_CANCELED"
              ? "" // Hide score if postponed or canceled
              : item.AwayScore}
          </Text>
        </View>
        {item.AwayPossession && <View style={styles.possessionIndicator} />}
      </View>
      <View style={styles.gameInfo}>
        {item.sport === "football" ||
        item.sport === "basketball" ||
        item.sport === "hockey" ? (
          <>
            <Text style={styles.gameStatus}>
              {item.Status === "STATUS_END_PERIOD" ? (
                <Text style={{ fontWeight: "bold" }}>
                  {item.StatusShortDetail}
                </Text>
              ) : item.Status === "STATUS_HALFTIME" ? (
                <Text style={{ fontWeight: "bold" }}>Half</Text>
              ) : item.Status === "STATUS_FINAL" ||
                item.Status === "STATUS_POSTPONED" ||
                item.Status === "STATUS_CANCELED" ||
                item.Status === "STATUS_DELAYED" ? (
                <Text style={{ fontWeight: "bold" }}>
                  {item.StatusShortDetail}
                </Text>
              ) : item.Status === "STATUS_SCHEDULED" ? (
                <Text style={{ fontWeight: "bold" }}>{item.GameTime}</Text>
              ) : (
                <>
                  <Text style={{ fontWeight: "bold" }}>
                    {item.displayClock}
                  </Text>
                  <Text style={{ color: "#999", fontWeight: "bold" }}>
                    {` ${getOrdinal(item.period)}`}
                  </Text>
                </>
              )}
            </Text>
            {(item.shortDownDistanceText || item.possessionText) && (
              <View style={styles.situationContainer}>
                {item.shortDownDistanceText && (
                  <Text style={styles.situationText}>
                    {item.shortDownDistanceText}
                  </Text>
                )}
                {item.possessionText && (
                  <Text style={styles.situationText}>
                    {item.possessionText}
                  </Text>
                )}
              </View>
            )}
          </>
        ) : item.sport === "baseball" ? ( // Check if the sport is baseball
          <>
            <Text style={styles.gameStatus}>
              {item.Status === "STATUS_SCHEDULED" ? (
                <Text style={{ fontWeight: "bold" }}>{item.GameTime}</Text>
              ) : item.Status === "STATUS_FINAL" ||
                item.Status === "STATUS_POSTPONED" ||
                item.Status === "STATUS_CANCELED" ||
                item.Status === "STATUS_DELAYED" ? (
                <Text style={{ fontWeight: "bold", color: "white" }}>
                  {item.StatusShortDetail}
                </Text>
              ) : (
                <View>
                  <Text style={{ fontWeight: "bold", color: "white" }}>
                    {item.StatusShortDetail}
                  </Text>
                  {item.Status !== "STATUS_FINAL" && ( // Show bases only if not final
                    <>
                      <View style={{ marginVertical: 10 }}>
                        {renderBasesComponent(
                          item.First,
                          item.Second,
                          item.Third
                        )}
                      </View>
                      <View>
                        {item.Outs !== null && (
                          <Text style={{ color: "white", fontWeight: "bold" }}>
                            {item.Outs} Outs
                          </Text>
                        )}
                      </View>
                    </>
                  )}
                </View>
              )}
            </Text>
          </>
        ) : (
          // Default case for other sports
          <Text style={styles.gameStatus}>
            {item.Status === "STATUS_SCHEDULED" ? (
              <Text style={{ fontWeight: "bold" }}>{item.GameTime}</Text>
            ) : item.Status === "STATUS_FINAL" ||
              item.Status === "STATUS_POSTPONED" ||
              item.Status === "STATUS_CANCELED" ||
              item.Status === "STATUS_DELAYED" ? (
              <Text style={{ fontWeight: "bold" }}>
                {item.StatusShortDetail}
              </Text>
            ) : (
              <Text style={{ fontWeight: "bold" }}>
                {item.StatusShortDetail}
              </Text>
            )}
          </Text>
        )}
      </View>
      <View style={styles.teamRow}>
        {item.HomePossession && <View style={styles.possessionIndicator} />}
        <View style={styles.teamContainer}>
          <Image source={{ uri: item.HomeLogoDark }} style={styles.teamLogo} />
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
              : item.Status === "STATUS_POSTPONED" ||
                item.Status === "STATUS_CANCELED"
              ? "" // Hide score if postponed or canceled
              : item.HomeScore}
          </Text>
        </View>
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
      const itemWidth = 72; // 70px width + 2px for margins (1px on each side)
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

  const renderBasesComponent = (First, Second, Third) => {
    return (
      <View style={styles.basesContainer}>
        <View style={styles.baseRow}>
          <View style={styles.emptySpace} />
          <View style={[styles.base, Second && styles.baseActive]} />
          <View style={styles.emptySpace} />
        </View>
        <View style={styles.baseRow}>
          <View style={[styles.base, Third && styles.baseActive]} />
          <View style={styles.emptySpace} />
          <View style={[styles.base, First && styles.baseActive]} />
        </View>
      </View>
    );
  };

  // Calculate the initial scroll index
  const initialScrollIndex = dates.indexOf(selectedDate);
  const centeredScrollIndex =
    initialScrollIndex !== -1 ? initialScrollIndex : 0;

  // Adjust the initial scroll index to center it
  const adjustedScrollIndex = Math.max(0, centeredScrollIndex); // No need for OFFSET here

  // Add this function to navigate to the reorder page
  const navigateToReorderSports = () => {
    navigation.navigate("ReorderSports", { sportsOrder });
  };

  return (
    <View style={styles.page}>
      <SafeAreaView />
      <View style={styles.sportCarouselContainer}>
        <FlatList
          ref={sportListRef}
          data={sportsOrder}
          renderItem={renderItem}
          keyExtractor={(item) => item}
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.sportCarousel}
          ListFooterComponent={renderReorderButton}
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
            length: 72, // Match the new itemWidth
            offset: 72 * index, // Match the new itemWidth
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
      <NavBar />
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
    marginHorizontal: 10,
  },
  sportCarousel: {
    flexGrow: 0,
  },
  reorderButton: {
    padding: 10,
    justifyContent: "center",
    alignItems: "center",
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
  },
  selectedItem: {
    // Removed background color change
  },
  itemText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 20, // Increased font size
    marginLeft: 4,
  },
  selectedText: {
    color: "yellow", // Change text color to yellow when selected
  },
  selectedIcon: {
    width: 24, // Increased icon size
    height: 24, // Increased icon size
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
    padding: 10,
    marginHorizontal: 10,
    marginVertical: 5,
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
    paddingHorizontal: 10,
    height: 30,
    marginTop: 5, // Set margin to 5 for spacing
    marginBottom: 5, // Set margin to 5 for spacing
  },
  dateItem: {
    padding: 5,
    marginHorizontal: 1, // Reduced from 3 to 1
    width: 70, // Reduced from 80 to 70
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
    fontWeight: "bold",
    color: "#999", // A lighter grey color
  },
  possessionIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "yellow",
    marginHorizontal: 2,
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
  searchBoxContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: "90%",
    position: "relative",
  },
  searchBox: {
    flex: 1,
    height: 40,
    color: "white",
    paddingHorizontal: 10,
    marginTop: 10,
    marginBottom: 5,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: "white",
  },
  clearButton: {
    position: "absolute",
    right: 10, // Position the button inside the search box
    padding: 5,
  },
  basesContainer: {
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
  },
  baseRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  base: {
    width: 15,
    height: 15,
    backgroundColor: "grey",
    transform: [{ rotate: "45deg" }], // Rotate to make it look like a diamond
  },
  baseActive: {
    backgroundColor: "yellow", // Change active base color to yellow
  },
  emptySpace: {
    width: 15,
    height: 15,
    transform: [{ rotate: "45deg" }], // Rotate to make it look like a diamond
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

// Add a new component for reordering sports
const ReorderSports = () => {
  const [sportsOrder, setSportsOrder] = useState(Object.keys(sportsData));
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [draggedValue, setDraggedValue] = useState(null);
  const animatedValue = useRef(new Animated.Value(0)).current;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: (evt, gestureState) => true,
      onMoveShouldSetPanResponder: (evt, gestureState) => true,
      onPanResponderGrant: (evt, gestureState) => {
        const index = Math.floor(gestureState.y0 / 50); // Assuming each item has a height of 50
        setDraggedIndex(index);
        setDraggedValue(sportsOrder[index]);
        animatedValue.setValue(0);
      },
      onPanResponderMove: (evt, gestureState) => {
        animatedValue.setValue(gestureState.dy);
      },
      onPanResponderRelease: (evt, gestureState) => {
        const newIndex = Math.floor(gestureState.moveY / 50);
        if (newIndex !== draggedIndex && draggedValue) {
          const items = Array.from(sportsOrder);
          items.splice(draggedIndex, 1);
          items.splice(newIndex, 0, draggedValue);
          setSportsOrder(items);
        }
        setDraggedIndex(null);
        setDraggedValue(null);
        Animated.spring(animatedValue, {
          toValue: 0,
          useNativeDriver: false,
        }).start();
      },
    })
  ).current;

  return (
    <View>
      {sportsOrder.map((sport, index) => (
        <Animated.View
          key={sport}
          {...(draggedIndex === index ? panResponder.panHandlers : {})}
          style={{
            transform: [
              { translateY: draggedIndex === index ? animatedValue : 0 },
            ],
            backgroundColor:
              draggedIndex === index ? "lightgrey" : "transparent",
            padding: 10,
            borderWidth: 1,
            borderColor: "white",
            marginVertical: 5,
          }}
        >
          <Text>{sportsData[sport].name}</Text>
        </Animated.View>
      ))}
    </View>
  );
};
