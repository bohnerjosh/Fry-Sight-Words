import React, { Component } from 'react'
import { StyleSheet, Button, Text, TextInput, View, TouchableOpacity, }
  from 'react-native'
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import MainScreen from "./screens/Main";
import Game from "./screens/Game";
import Results from "./screens/Results";

const Stack = createNativeStackNavigator();

function App() {
    return (
        <NavigationContainer>
            <Stack.Navigator screenOptions={{headerShown: false}}>
                <Stack.Screen name="Main" component={MainScreen} />
                <Stack.Screen name="Game" component={Game} />
                <Stack.Screen name="Results" component={Results} />
            </Stack.Navigator>
        </NavigationContainer>
    );
}
export default App;
