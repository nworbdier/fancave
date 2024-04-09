import React, { useState, useEffect } from "react";
import { Platform, StyleSheet, View, SafeAreaView } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Welcome from "./onboarding/welcome";
import SignUp from "./onboarding/signup";
import Home from "./main/home";
import AccountScreen from "./main/account";
import { FIREBASE_AUTH } from "./firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";

const Stack = createNativeStackNavigator();

function Main() {
  return (
    <View style={styles.app}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Home" component={Home} />
        <Stack.Screen name="Account" component={AccountScreen} />
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
    backgroundColor: "rgba(64, 64, 64, 0.40)", // 75% opacity black
  },
});
