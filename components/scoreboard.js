import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { renderBasesComponent } from './bases';

const Scoreboard = ({ item, onPress }) => {
  return (
    <TouchableOpacity style={styles.gameContainer} onPress={onPress}>
      <View style={styles.teamRow}>
        <View style={styles.teamInfoContainer}>
          <Image
            source={{ uri: item.AwayLogoDark }}
            style={[
              styles.teamLogo,
              item.Status === "STATUS_FINAL" &&
                !item.AwayWinner &&
                styles.loserLogo,
            ]}
          />
          <Text
            style={[
              styles.teamName,
              item.Status === "STATUS_FINAL" &&
                (item.AwayWinner ? styles.winnerText : styles.loserText),
            ]}
          >
            {item.AwayAbbrev}
            {item.AwayRank && ` (${item.AwayRank})`}
          </Text>
        </View>
        <View style={styles.scoreContainer}>
          <Text
            style={[
              item.Status === "STATUS_SCHEDULED"
                ? styles.recordText
                : styles.scoreText,
              item.Status === "STATUS_FINAL" &&
                (item.AwayWinner ? styles.winnerText : styles.loserText),
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
          {item.AwayPossession && (
            <View
              style={[
                styles.possessionIndicator,
                item.isRedZone ? styles.redPossessionIndicator : null,
              ]}
            />
          )}
        </View>
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
        ) : item.sport === "baseball" ? (
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
                  {item.Status !== "STATUS_FINAL" && (
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
        <View style={styles.scoreContainer}>
          {item.HomePossession && (
            <View
              style={[
                styles.possessionIndicator,
                item.isRedZone ? styles.redPossessionIndicator : null,
              ]}
            />
          )}
          <Text
            style={[
              item.Status === "STATUS_SCHEDULED"
                ? styles.recordText
                : styles.scoreText,
              item.Status === "STATUS_FINAL" &&
                (item.HomeWinner ? styles.winnerText : styles.loserText),
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
        <View style={styles.teamInfoContainer}>
          <Image
            source={{ uri: item.HomeLogoDark }}
            style={[
              styles.teamLogo,
              item.Status === "STATUS_FINAL" &&
                !item.HomeWinner &&
                styles.loserLogo,
            ]}
          />
          <Text
            style={[
              styles.teamName,
              item.Status === "STATUS_FINAL" &&
                (item.HomeWinner ? styles.winnerText : styles.loserText),
            ]}
          >
            {item.HomeAbbrev}
            {item.HomeRank && ` (${item.HomeRank})`}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
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

const styles = StyleSheet.create({
  gameContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    marginVertical: 5,
    marginHorizontal: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'white',
  },
  teamRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-evenly',
    flex: 1,
  },
  teamInfoContainer: {
    alignItems: 'center',
  },
  teamLogo: {
    width: 50,
    height: 50,
    marginBottom: 5,
  },
  teamName: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
    textAlign: 'center',
  },
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  recordText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'normal',
  },
  scoreText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  possessionIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'yellow',
    marginHorizontal: 10,
  },
  redPossessionIndicator: {
    backgroundColor: 'red',
  },
  gameInfo: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  gameStatus: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
  },
  situationContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  situationText: {
    color: 'white',
    fontSize: 15,
    textAlign: 'center',
    marginTop: 3,
  },
  winnerText: {
    fontWeight: 'bold',
    color: 'white',
  },
  loserText: {
    fontWeight: 'bold',
    color: 'white',
    opacity: 0.5,
  },
  loserLogo: {
    opacity: 0.5,
  },
});

export default ScoreboardGame;
