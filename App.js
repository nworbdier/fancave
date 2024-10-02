import React, { useState, useEffect } from "react";
import { Platform, StyleSheet, View, SafeAreaView } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Welcome from "./onboarding/welcome";
import SignUp from "./onboarding/signup";
import Home from "./main/home";
import Notifications from "./main/notipref";
import Theme from "./main/theme";
import Search from "./main/search";
import Settings from "./main/settings";
import SportSelector from "./main/scores";
import { FIREBASE_AUTH } from "./firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";

const Stack = createNativeStackNavigator();

function Main() {
  return (
    <View style={styles.app}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Home" component={Home} />
        <Stack.Screen name="Search" component={Search} />
        <Stack.Screen name="Settings" component={Settings} />
        <Stack.Screen name="Notifications" component={Notifications} />
        <Stack.Screen name="Theme" component={Theme} />
        <Stack.Screen name="SportSelector" component={SportSelector} />
      </Stack.Navigator>
    </View>
  );
}

function Onboarding() {
  return (
    <View style={styles.app}>
      <SafeAreaView style={styles.app}>
        <View style={styles.content}>
          <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Welcome" component={Welcome} />
            <Stack.Screen name="SignUp" component={SignUp} />
          </Stack.Navigator>
        </View>
      </SafeAreaView>
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
    <View style={styles.app}>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          {user ? (
            <Stack.Screen name="Main" component={Main} />
          ) : (
            <Stack.Screen name="Onboarding" component={Onboarding} />
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </View>
  );
}

const styles = StyleSheet.create({
  app: {
    flex: 1,
    backgroundColor: "black",
  },
  loadingScreen: {
    flex: 1,
    backgroundColor: "black",
  },
  content: {
    flex: 1,
    backgroundColor: "grey", // 75% opacity black
  },
});
