import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Image, ScrollView } from "react-native";
import { useRoute } from "@react-navigation/native";

export default function TeamDetails() {
  const route = useRoute();
  const { teamId, sportName, league } = route.params; // Get teamId from route parameters
  const [teamData, setTeamData] = useState(null);
  const [logo, setLogo] = useState(null);
  const [name, setName] = useState(null);
  const [record, setRecord] = useState(null);
  const [rank, setRank] = useState(null);

  const fetchTeamDetails = async () => {
    const response = await fetch(
      `https://site.api.espn.com/apis/site/v2/sports/${sportName}/${league}/teams/${teamId}`
    );
    const data = await response.json();

    const logo = data.team.logos[1].href;
    const name = data.team.displayName;
    const record = data.team.record.items[0].summary;
    const rank = data.team.rank;

    setLogo(logo);
    setName(name);
    setRecord(record);
    setRank(rank);
  };

  useEffect(() => {
    fetchTeamDetails();
  }, []);

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Image style={styles.logo} source={{ uri: logo }} />
        <Text style={styles.name}>{name}</Text>
        <Text style={styles.record}>{record}</Text>
        <Text style={styles.rank}>Rank: #{rank}</Text>
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
    width: 150,
    height: 150,
    marginBottom: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "white",
  },
  name: {
    fontSize: 28,
    fontWeight: "bold",
    color: "white",
    marginBottom: 10,
  },
  record: {
    fontSize: 20,
    color: "white",
    marginBottom: 5,
  },
  rank: {
    fontSize: 20,
    color: "white",
    marginBottom: 20,
  },
});
