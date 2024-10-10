import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import Scores from "./scores"; // Adjust the import based on your file structure
import ReorderSports from "./ReorderSports"; // Import the new component

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Scores">
        <Stack.Screen 
          name="Scores" 
          component={Scores} 
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="ReorderSports" 
          component={ReorderSports}
          options={{ 
            title: "Reorder Sports",
            headerStyle: {
              backgroundColor: 'black',
            },
            headerTintColor: 'white',
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}