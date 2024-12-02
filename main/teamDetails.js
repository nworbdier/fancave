import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { useRoute } from "@react-navigation/native";

export default function TeamDetails() {
  const route = useRoute();
  const { teamId, sportName, league } = route.params; // Get teamId from route parameters
  const [teamData, setTeamData] = useState(null);
  const [scheduleData, setScheduleData] = useState(null);
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
  const shortDisplayName = teamData.team.shortDisplayName;
  const name = teamData.team.name;
  const record = teamData.team.record.items[0].summary;
  const rank = teamData.team.rank;

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Image style={styles.logo} source={{ uri: logo }} />
          <View
            style={{
              flexDirection: "column",
              alignItems: "center",
              marginLeft: 10,
            }}
          >
            <Text style={styles.name}>
              {rank ? `#${rank} ` : ""}
              {shortDisplayName}
            </Text>
            <Text style={styles.name}>{name}</Text>
            <Text style={styles.record}>{record}</Text>
          </View>
        </View>
        <Text style={styles.schedule}>Schedule</Text>
        <View style={styles.scheduleContainer}></View>
      </ScrollView>
    </View>
  );
}

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
    marginBottom: 20,
  },
  name: {
    fontSize: 20,
    fontWeight: "bold",
    color: "white",
    marginBottom: 10,
  },
  record: {
    fontSize: 18,
    color: "white",
    marginBottom: 10,
  },
  schedule: {
    fontSize: 24,
    color: "white",
    marginBottom: 10,
    fontWeight: "bold",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "black",
  },
});
