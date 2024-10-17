import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  ActivityIndicator,
  TouchableOpacity,
  RefreshControl,
  ScrollView, // Import ScrollView
} from "react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";

export default function ScoresDetails({ route }) {
  const { eventId, sportName, league } = route.params;
  const navigation = useNavigation();
  const [gameData, setGameData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("Plays");
  const [refreshing, setRefreshing] = useState(false);
  const [playData, setPlayData] = useState([]); // Ensure this is initialized as an empty array
  const [loadingPlays, setLoadingPlays] = useState(true); // New state for loading plays

  useFocusEffect(
    useCallback(() => {
      fetchGameDetails();
      fetchPlayDetails(); // Fetch play details
      const interval = setInterval(() => {
        fetchGameDetails();
        fetchPlayDetails(); // Fetch play details periodically
      }, 5000);
      return () => clearInterval(interval);
    }, [])
  );

  const fetchGameDetails = async () => {
    try {
      const url = `https://site.api.espn.com/apis/site/v2/sports/${sportName}/${league}/summary?event=${eventId}`;
      console.log("Fetching game details from URL:", url);

      const response = await fetch(url);
      const data = await response.json();
      setGameData(data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching game details:", error);
      setLoading(false);
    }
  };

  const fetchPlayDetails = async () => {
    setLoadingPlays(true); // Set loading to true when fetching plays
    try {
      const url = `https://sports.core.api.espn.com/v2/sports/${sportName}/leagues/${league}/events/${eventId}/competitions/${eventId}/plays?limit=1000`;
      const response = await fetch(url);
      const data = await response.json();
      setPlayData(data.items || []); // Ensure playData is set to an empty array if items is undefined
    } catch (error) {
      console.error("Error fetching play details:", error);
    } finally {
      setLoadingPlays(false); // Set loading to false after fetching
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchGameDetails();
    setRefreshing(false);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="white" />
      </View>
    );
  }

  const competition = gameData?.header?.competitions[0];
  const Status = competition?.status?.type?.name;
  const StatusShortDetail = competition?.status?.type?.shortDetail;
  const GameTime = new Date(competition?.date).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
  const displayClock = competition?.status?.displayClock;
  const period = competition?.status?.period;
  const Balls = gameData?.situation?.balls;
  const Strikes = gameData?.situation?.strikes;
  const Outs = gameData?.situation?.outs;
  const OnFirst = !!gameData?.situation?.onFirst?.playerId;
  const OnSecond = !!gameData?.situation?.onSecond?.playerId;
  const OnThird = !!gameData?.situation?.onThird?.playerId;

  const isPlayoff = gameData?.header?.season?.type === 3;
  const seriesIndex = sportName === 'baseball' ? 0 : 1;
  const seriesData = isPlayoff ? gameData?.header?.competitions[0]?.series[seriesIndex] : null;

  const home = competition?.competitors[0];
  const homeAbbreviation = home?.team?.abbreviation;
  const homeLogo = home?.team?.logos[1]?.href;
  const homeScore = home?.score;
  const homePossession = home?.possession;
  const homeRecord = isPlayoff && seriesData
    ? `${seriesData?.competitors[0]?.wins || 0}-${seriesData?.competitors[1]?.wins || 0}`
    : home?.record[0]?.summary;

  const away = competition?.competitors[1];
  const awayAbbreviation = away?.team?.abbreviation;
  const awayLogo = away?.team?.logos[1]?.href;
  const awayScore = away?.score;
  const awayRecord = isPlayoff && seriesData
    ? `${seriesData?.competitors[1]?.wins || 0}-${seriesData?.competitors[0]?.wins || 0}`
    : away?.record[0]?.summary;
  const awayPossession = away?.possession;

  const plays = gameData?.drives?.current?.plays || [];
  const lastPlay = plays[plays.length - 1];
  const shortDownDistanceText = lastPlay?.end?.shortDownDistanceText;
  const possessionText = lastPlay?.end?.possessionText;
  const isRedZone = competition?.situation?.isRedZone;

  const getScoreOrRecord = (score, record) => {
    return score !== undefined ? score : record || "N/A";
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "Plays":
        return (
          <ScrollView>
            {playData.length > 0 ? ( // Check if playData is not empty
              playData
                .slice()
                .reverse()
                .map((play, index) => (
                  <View style={styles.playContainer} key={index}>
                    <Text style={styles.playText}>{play.alternativeText}</Text>
                  </View>
                ))
            ) : (
              <Text style={styles.tabContentText}>No plays available</Text>
            )}
          </ScrollView>
        );
      case "Stats":
        return <Text style={styles.tabContentText}>Stats Content</Text>;
      case awayAbbreviation:
        return (
          <Text style={styles.tabContentText}>
            {awayAbbreviation} Team Content
          </Text>
        );
      case homeAbbreviation:
        return (
          <Text style={styles.tabContentText}>
            {homeAbbreviation} Team Content
          </Text>
        );
      default:
        return null;
    }
  };

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

  const getOrdinal = (period) => {
    if (period === 1) return "1st";
    if (period === 2) return "2nd";
    if (period === 3) return "3rd";
    if (period === 4) return "4th";
    if (period === 5) return "OT";
    if (period > 5) return `${period - 4}OT`;
  };

  return (
    <View style={styles.page}>
      <View style={styles.gameContainer}>
        <View style={styles.teamContainer}>
          <View style={{ flexDirection: "column", alignItems: "center" }}>
            <Image source={{ uri: awayLogo }} style={styles.teamLogo} />
            <Text style={styles.teamName}>{awayAbbreviation}</Text>
          </View>
          <View style={styles.scoreContainer}>
            <Text
              style={[
                styles.awayScoreOrRecord,
                {
                  fontWeight: awayScore !== undefined ? "bold" : "normal",
                  fontSize: awayScore !== undefined ? 24 : 20,
                },
              ]}
            >
              {getScoreOrRecord(awayScore, awayRecord)}
            </Text>
            {awayPossession && (
              <View
                style={[
                  styles.possessionIndicator,
                  isRedZone ? styles.redPossessionIndicator : null,
                ]}
              />
            )}
          </View>
        </View>
        <View style={styles.gameInfo}>
          {sportName === "football" ||
          sportName === "basketball" ||
          sportName === "hockey" ? (
            <>
              <Text style={styles.gameInfoText}>
                {Status === "STATUS_END_PERIOD" ? (
                  <Text style={{ fontWeight: "bold" }}>
                    {StatusShortDetail}
                  </Text>
                ) : Status === "STATUS_HALFTIME" ? (
                  <Text style={{ fontWeight: "bold" }}>Half</Text>
                ) : Status === "STATUS_FINAL" ||
                  Status === "STATUS_POSTPONED" ||
                  Status === "STATUS_CANCELED" ||
                  Status === "STATUS_DELAYED" ? (
                  <Text style={{ fontWeight: "bold" }}>
                    {StatusShortDetail}
                  </Text>
                ) : Status === "STATUS_SCHEDULED" ? (
                  <Text style={{ fontWeight: "bold" }}>{GameTime}</Text>
                ) : (
                  <>
                    <Text style={{ fontWeight: "bold" }}>{displayClock}</Text>
                    <Text style={{ color: "#999", fontWeight: "bold" }}>
                      {` ${getOrdinal(period)}`}
                    </Text>
                  </>
                )}
              </Text>
              {(shortDownDistanceText || possessionText) && (
                <View style={styles.situationContainer}>
                  {shortDownDistanceText && (
                    <Text style={styles.situationText}>
                      {shortDownDistanceText}
                    </Text>
                  )}
                  {possessionText && (
                    <Text style={styles.situationText}>{possessionText}</Text>
                  )}
                </View>
              )}
            </>
          ) : sportName === "baseball" ? (
            <>
              <Text style={styles.gameInfoText}>
                {Status === "STATUS_SCHEDULED" ? (
                  <Text style={{ fontWeight: "bold" }}>{GameTime}</Text>
                ) : Status === "STATUS_FINAL" ||
                  Status === "STATUS_POSTPONED" ||
                  Status === "STATUS_CANCELED" ||
                  Status === "STATUS_DELAYED" ? (
                  <Text style={{ fontWeight: "bold", color: "white" }}>
                    {StatusShortDetail}
                  </Text>
                ) : (
                  <View>
                    <Text style={{ fontWeight: "bold", color: "white" }}>
                      {StatusShortDetail}
                    </Text>
                    {Status !== "STATUS_FINAL" && (
                      <>
                        <View style={{ alignItems: "center" }}>
                          <View style={{ marginVertical: 10 }}>
                            {renderBasesComponent(OnFirst, OnSecond, OnThird)}
                          </View>
                          <View>
                            <Text
                              style={{ color: "white", fontWeight: "bold" }}
                            >
                              {Outs} Outs
                            </Text>
                          </View>
                        </View>
                      </>
                    )}
                  </View>
                )}
              </Text>
            </>
          ) : (
            <Text style={styles.gameInfoText}>
              {Status === "STATUS_SCHEDULED" ? (
                <Text style={{ fontWeight: "bold" }}>{GameTime}</Text>
              ) : Status === "STATUS_FINAL" ||
                Status === "STATUS_POSTPONED" ||
                Status === "STATUS_CANCELED" ||
                Status === "STATUS_DELAYED" ? (
                <Text style={{ fontWeight: "bold" }}>{StatusShortDetail}</Text>
              ) : (
                <Text style={{ fontWeight: "bold" }}>{StatusShortDetail}</Text>
              )}
            </Text>
          )}
        </View>
        <View style={styles.teamContainer}>
          <View style={styles.scoreContainer}>
            {homePossession && (
              <View
                style={[
                  styles.possessionIndicator,
                  isRedZone ? styles.redPossessionIndicator : null,
                ]}
              />
            )}
            <Text
              style={[
                styles.homeScoreOrRecord,
                {
                  fontWeight: homeScore !== undefined ? "bold" : "normal",
                  fontSize: homeScore !== undefined ? 24 : 20,
                },
              ]}
            >
              {getScoreOrRecord(homeScore, homeRecord)}
            </Text>
          </View>
          <View style={{ flexDirection: "column", alignItems: "center" }}>
            <Image source={{ uri: homeLogo }} style={styles.teamLogo} />
            <Text style={styles.teamName}>{homeAbbreviation}</Text>
          </View>
        </View>
      </View>
      <View style={styles.content}>
        <View style={styles.tabBar}>
          {["Plays", "Stats", awayAbbreviation, homeAbbreviation].map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[styles.tab, activeTab === tab && styles.activeTab]}
              onPress={() => setActiveTab(tab)}
            >
              <Text style={[styles.tabText, activeTab === tab]}>{tab}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <View style={styles.tabContent}>{renderTabContent()}</View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: "black",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "black",
  },
  gameInfo: {
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
  },
  gameInfoText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
  },
  gameContainer: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 10,
  },
  teamContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  teamLogo: {
    width: 50,
    height: 50,
  },
  teamName: {
    color: "white",
    fontWeight: "bold",
    fontSize: 18,
    textAlign: "center",
    marginTop: 10,
  },
  awayScoreOrRecord: {
    color: "white",
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginLeft: 20,
    marginRight: 10, // Add right margin to create space for the indicator
  },
  homeScoreOrRecord: {
    color: "white",
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginLeft: 10, // Add left margin to create space for the indicator
    marginRight: 20,
  },
  content: {
    flex: 9,
    justifyContent: "center",
    alignItems: "center",
  },
  tabBar: {
    flexDirection: "row",
    marginTop: 10,
  },
  tab: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  activeTab: {
    borderBottomColor: "dodgerblue",
  },
  tabText: {
    fontWeight: "bold",
    color: "white",
    fontSize: 18,
  },
  tabContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  tabContentText: {
    color: "white",
    fontSize: 18,
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
    transform: [{ rotate: "45deg" }],
  },
  baseActive: {
    backgroundColor: "yellow",
  },
  emptySpace: {
    width: 15,
    height: 15,
    transform: [{ rotate: "45deg" }],
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
  scoreContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  possessionIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "yellow",
  },
  redPossessionIndicator: {
    backgroundColor: "red",
  },
  playContainer: {
    borderBottomWidth: 1,
    borderBottomColor: "grey",
    paddingHorizontal: 10,
    paddingVertical: 25,
  },
  playText: {
    color: "white",
    fontSize: 18,
  },
});
