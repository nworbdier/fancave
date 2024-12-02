import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";

export default function TeamDetails() {
  const route = useRoute();
  const navigation = useNavigation();
  const { teamId, sportName, league } = route.params; // Get teamId from route parameters
  const [teamData, setTeamData] = useState(null);
  const [scheduleData, setScheduleData] = useState(null);
  const [activeTab, setActiveTab] = useState("Schedule");

  const fetchTeamDetails = async () => {
    const response = await fetch(
      `https://site.api.espn.com/apis/site/v2/sports/${sportName}/${league}/teams/${teamId}`
    );
    console.log(response.url);
    const data = await response.json();
    setTeamData(data);
  };

  const fetchTeamSchedule = async () => {
    const response = await fetch(
      `https://site.api.espn.com/apis/site/v2/sports/${sportName}/${league}/teams/${teamId}/schedule`
    );
    console.log(response.url);

    const data = await response.json();
    setScheduleData(data);
    // Handle schedule data if needed
  };

  useEffect(() => {
    fetchTeamDetails();
    fetchTeamSchedule();
  }, []);

  // Check if teamData is available before accessing its properties
  if (!teamData) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator color="white" />
      </View>
    );
  }

  const logo = teamData.team.logos[1].href;
  const location = teamData.team.location;
  const name = teamData.team.name;
  const record = teamData.team.record.items[0].summary;
  const rank = teamData.team.rank;
  const standingSummary = teamData.team.standingSummary;

  // Add this new function to render tab content
  const renderTabContent = () => {
    switch (activeTab) {
      case "Schedule":
        return (
          <ScrollView style={styles.scheduleContainer}>
            {scheduleData?.events
              ?.filter(
                (event) =>
                  event.competitions[0].status.type.name === "STATUS_FINAL"
              )
              .reverse()
              .map((event, index) => {
                const eventId = event.id;
                const homeTeam = event.competitions[0].competitors[0];
                const awayTeam = event.competitions[0].competitors[1];
                const homeScore = homeTeam.score?.value;
                const awayScore = awayTeam.score?.value;

                return (
                  <TouchableOpacity
                    key={index}
                    style={styles.gameContainer}
                    onPress={() =>
                      navigation.replace("ScoresDetails", {
                        eventId: eventId,
                        sportName: sportName,
                        league: league,
                      })
                    }
                  >
                    <View style={styles.teamScoreContainer}>
                      <View style={styles.teamLogoContainer}>
                        <Image
                          style={styles.teamLogo}
                          source={{ uri: awayTeam.team.logos[0].href }}
                        />
                        <Text style={styles.teamName}>
                          {awayTeam.team.abbreviation}
                        </Text>
                      </View>
                      <Text style={styles.score}>{awayScore}</Text>
                    </View>
                    <Text style={styles.vs}>vs</Text>
                    <View style={styles.teamScoreContainer}>
                      <Text style={styles.score}>{homeScore}</Text>
                      <View style={styles.teamLogoContainer}>
                        <Image
                          style={styles.teamLogo}
                          source={{ uri: homeTeam.team.logos[0].href }}
                        />
                        <Text style={styles.teamName}>
                          {homeTeam.team.abbreviation}
                        </Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })}
          </ScrollView>
        );
      case "Stats":
        return (
          <View style={styles.comingSoonContainer}>
            <Text style={styles.comingSoonText}>Stats Coming Soon</Text>
          </View>
        );
      case "Players":
        return (
          <View style={styles.comingSoonContainer}>
            <Text style={styles.comingSoonText}>Players Coming Soon</Text>
          </View>
        );
      default:
        return null;
    }
  };

  // Update the return statement
  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <View style={styles.teamHeaderRow}>
          <Image style={styles.logo} source={{ uri: logo }} />
          <View style={styles.teamInfoContainer}>
            <Text style={styles.name}>
              {rank ? `#${rank} ` : ""}
              {location} {name}
            </Text>
            <Text style={styles.record}>
              {record} | {standingSummary}
            </Text>
          </View>
        </View>

        <View style={styles.tabBar}>
          {["Schedule", "Stats", "Players"].map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[styles.tab, activeTab === tab && styles.activeTab]}
              onPress={() => setActiveTab(tab)}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === tab && styles.activeTabText,
                ]}
              >
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.content}>{renderTabContent()}</View>
    </View>
  );
}

// Update the styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "black",
  },
  scrollContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingBottom: 20,
  },
  logo: {
    width: 75,
    height: 75,
  },
  name: {
    fontSize: 20,
    fontWeight: "bold",
    color: "white",
    marginBottom: 5,
  },
  record: {
    fontSize: 18,
    color: "white",
  },
  schedule: {
    fontSize: 24,
    color: "white",
    marginBottom: 5,
    fontWeight: "bold",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "black",
  },
  scheduleContainer: {
    width: "100%",
  },
  gameContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    marginVertical: 5,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "white",
  },
  teamScoreContainer: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    alignItems: "center",
    flex: 1,
  },
  teamLogoContainer: {
    flexDirection: "column",
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
    fontWeight: "bold",
    fontSize: 16,
    textAlign: "center",
  },
  score: {
    color: "white",
    fontSize: 24,
    fontWeight: "bold",
  },
  vs: {
    color: "#666",
    fontSize: 14,
    marginHorizontal: 10,
    flex: 1,
    textAlign: "center",
  },
  headerContainer: {
    width: "100%",
  },
  teamHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    marginHorizontal: 10,
  },
  teamInfoContainer: {
    flexDirection: "column",
    alignItems: "left",
    marginLeft: 20,
  },
  content: {
    flex: 1,
    width: "100%",
    marginTop: 5,
  },
  tabBar: {
    flexDirection: "row",
    marginTop: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#333",
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
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  activeTabText: {
    color: "dodgerblue",
  },
  comingSoonContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  comingSoonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
});
