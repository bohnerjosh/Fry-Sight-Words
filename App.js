import React, { Component } from 'react'
import { LogBox }
  from 'react-native'
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { RootSiblingParent } from 'react-native-root-siblings';

import MainScreen from "./screens/Main";
import Game from "./screens/Game";
import Results from "./screens/Results";

// TEMPORARY: Prevents NativeEventEmmiter from throwing warnings
LogBox.ignoreLogs(['new NativeEventEmitter']);

const Stack = createNativeStackNavigator();

const App = () => {
    return (
        <RootSiblingParent>
            <NavigationContainer>
                <Stack.Navigator screenOptions={{headerShown: false}}>
                    <Stack.Screen name="Main" component={MainScreen} />
                    <Stack.Screen name="Game" component={Game} />
                    <Stack.Screen name="Results" component={Results} />
                </Stack.Navigator>
            </NavigationContainer>
        </RootSiblingParent>
        
    );
}
export default App;
