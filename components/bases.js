import { View, StyleSheet } from "react-native";

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

const styles = StyleSheet.create({
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
});

export default renderBasesComponent;
