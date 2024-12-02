import React, { useState, useEffect } from "react";
import { Platform, StyleSheet, View, SafeAreaView } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Welcome from "./onboarding/welcome";
import SignUp from "./onboarding/signup";
import Home from "./main/home";
import Account from "./main/accountSettings";
import NotificationSettings from "./main/notifySettings";
import ThemeSettings from "./main/themeSettings";
import Search from "./main/search";
import Settings from "./main/settings";
import Feedback from "./main/feedback";
import ActivityCenter from "./main/activityCenter";
import Scores from "./main/scores";
import ScoresDetails from "./main/scoresDetails";
import PlayerDetails from "./main/playerDetails";
import TeamDetails from "./main/teamDetails";
import Feed from "./main/feed";
import ReorderSports from "./main/ReorderSports";
import { FIREBASE_AUTH } from "./firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";
import { SportsProvider } from "./main/SportsContext";
import NavBar from "./components/navBar"; // Import your NavBar

const Stack = createNativeStackNavigator();

function Main() {
  return (
    <View style={styles.app}>
      <SafeAreaView style={styles.safeArea} />
      <View style={styles.content}>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Feed" component={Feed} />
          <Stack.Screen name="Home" component={Home} />
          <Stack.Screen name="Search" component={Search} />
          <Stack.Screen name="Settings" component={Settings} />
          <Stack.Screen name="Feedback" component={Feedback} />
          <Stack.Screen
            name="NotificationSettings"
            component={NotificationSettings}
          />
          <Stack.Screen name="ThemeSettings" component={ThemeSettings} />
          <Stack.Screen name="ActivityCenter" component={ActivityCenter} />
          <Stack.Screen name="Scores" component={Scores} />
          <Stack.Screen name="ScoresDetails" component={ScoresDetails} />
          <Stack.Screen name="PlayerDetails" component={PlayerDetails} />
          <Stack.Screen name="TeamDetails" component={TeamDetails} />
          <Stack.Screen name="ReorderSports" component={ReorderSports} />
          <Stack.Screen name="Account" component={Account} />
          <Stack.Screen name="SportsProvider" component={SportsProvider} />
        </Stack.Navigator>
      </View>
      <NavBar />
    </View>
  );
}

function Onboarding() {
  return (
    <View style={styles.app}>
      <SafeAreaView style={styles.safeArea} />
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Welcome" component={Welcome} />
        <Stack.Screen name="SignUp" component={SignUp} />
      </Stack.Navigator>
    </View>
  );
}

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(FIREBASE_AUTH, (user) => {
      setUser(user);
      setLoading(false);
    });

    // Cleanup function
    return unsubscribe;
  }, []);

  if (loading) {
    return <View style={styles.loadingScreen} />;
  }

  return (
    <SportsProvider>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          {user ? (
            <Stack.Screen name="Main" component={Main} />
          ) : (
            <Stack.Screen name="Onboarding" component={Onboarding} />
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </SportsProvider>
  );
}
const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: "black",
  },
  app: {
    flex: 1,
    backgroundColor: "black",
  },
  content: {
    flex: 10,
    backgroundColor: "black",
  },
  loadingScreen: {
    flex: 1,
    backgroundColor: "black",
  },
});
