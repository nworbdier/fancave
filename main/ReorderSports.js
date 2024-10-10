import React, { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Animated,
  PanResponder,
  TouchableOpacity,
  SafeAreaView,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { sportsData } from "./scores";

const ReorderSports = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { sportsOrder: initialSportsOrder } = route.params;
  const [sportsOrder, setSportsOrder] = useState(initialSportsOrder);
  const [draggedIndex, setDraggedIndex] = useState(null);
  const itemHeight = 50;

  const pan = useRef(new Animated.ValueXY()).current;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (_, gestureState) => {
        const index = Math.floor(gestureState.y0 / itemHeight);
        setDraggedIndex(index);
        pan.setOffset({
          y: index * itemHeight,
        });
      },
      onPanResponderMove: Animated.event([null, { dy: pan.y }], {
        useNativeDriver: false,
      }),
      onPanResponderRelease: (_, gestureState) => {
        pan.flattenOffset();
        const newIndex = Math.floor(gestureState.moveY / itemHeight);
        if (newIndex !== draggedIndex && draggedIndex !== null) {
          const newOrder = [...sportsOrder];
          const [reorderedItem] = newOrder.splice(draggedIndex, 1);
          newOrder.splice(newIndex, 0, reorderedItem);
          setSportsOrder(newOrder);
        }
        setDraggedIndex(null);
        pan.setValue({ x: 0, y: 0 });
      },
    })
  ).current;

  const saveSportsOrder = async () => {
    try {
      await AsyncStorage.setItem("sportsOrder", JSON.stringify(sportsOrder));
      navigation.navigate("Scores", { updatedSportsOrder: sportsOrder });
    } catch (error) {
      console.error("Error saving sports order:", error);
    }
  };

  const renderSportItem = (sport, index) => {
    const isBeingDragged = draggedIndex === index;
    const itemStyle = {
      ...styles.sportItem,
      backgroundColor: isBeingDragged ? "lightgrey" : "transparent",
      elevation: isBeingDragged ? 5 : 0,
      zIndex: isBeingDragged ? 1 : 0,
      transform: [
        {
          translateY: isBeingDragged
            ? pan.y.interpolate({
                inputRange: [-300, 0, 300],
                outputRange: [-300, 0, 300],
                extrapolate: "clamp",
              })
            : 0,
        },
      ],
    };

    return (
      <Animated.View
        key={sportsData[sport].id}
        style={itemStyle}
        {...(isBeingDragged ? panResponder.panHandlers : {})}
      >
        <Text style={styles.sportText}>{sportsData[sport].name}</Text>
      </Animated.View>
    );
  };

  return (
    <View style={styles.container}>
      <SafeAreaView />
      <Text style={styles.title}>Reorder Sports</Text>
      {sportsOrder.map(renderSportItem)}
      <TouchableOpacity style={styles.doneButton} onPress={saveSportsOrder}>
        <Text style={styles.doneButtonText}>Done</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "black",
    padding: 20,
  },
  title: {
    color: "white",
    fontSize: 24,
    marginBottom: 20,
  },
  sportItem: {
    padding: 10,
    borderWidth: 1,
    borderColor: "white",
    marginVertical: 5,
    height: 50, // Fixed height for each item
    justifyContent: "center",
  },
  sportText: {
    color: "white",
    fontSize: 18,
  },
  doneButton: {
    backgroundColor: "yellow",
    padding: 10,
    alignItems: "center",
    borderRadius: 5,
    marginTop: 20,
  },
  doneButtonText: {
    color: "black",
    fontWeight: "bold",
    fontSize: 18,
  },
});

export default ReorderSports;
