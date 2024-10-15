import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  ActivityIndicator,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";

export default function ScoresDetails({ route }) {
  const { eventId, sportName, league } = route.params;
  const navigation = useNavigation();
  const [gameData, setGameData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("Game");
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    useCallback(() => {
      fetchGameDetails();
      const interval = setInterval(fetchGameDetails, 5000);
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
  const home = competition?.competitors[0];
  const homeAbbreviation = home?.team?.abbreviation;
  const homeLogo = home?.team?.logos[1]?.href;
  const homeScore = home?.score;
  const homePossession = home?.possession;
  const homeRecord = home?.record[0]?.summary;
  const away = competition?.competitors[1];
  const awayAbbreviation = away?.team?.abbreviation;
  const awayLogo = away?.team?.logos[1]?.href;
  const awayScore = away?.score;
  const awayRecord = away?.record[0]?.summary;
  const awayPossession = away?.possession;
  const shortDownDistanceText = competition?.situation?.shortDownDistanceText;
  const possessionText = competition?.situation?.possessionText;
  const isRedZone = competition?.situation?.isRedZone;

  const getScoreOrRecord = (score, record) => {
    return score !== undefined ? score : record || "N/A";
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "Game":
        return <Text style={styles.tabContentText}>Game Content</Text>;
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
          <View style={{ flexDirection: "column", alignItems: "center" }}>
            <Image source={{ uri: homeLogo }} style={styles.teamLogo} />
            <Text style={styles.teamName}>{homeAbbreviation}</Text>
          </View>
        </View>
      </View>
      <View style={styles.content}>
        <View style={styles.tabBar}>
          {["Game", "Stats", awayAbbreviation, homeAbbreviation].map((tab) => (
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
    flexDirection: "row",
    justifyContent: "space-between",
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
  },
  homeScoreOrRecord: {
    color: "white",
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
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
});
