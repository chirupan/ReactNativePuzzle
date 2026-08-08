import * as Device from 'expo-device';
import React from "react-native";
import { NavigationContainer, NavigationIndependentTree } from '@react-navigation/native';
import { createNativeStackNavigator } from 'expo-router/build/react-navigation/native-stack';
// file-based imports
import { App } from "../components/App";
import { Start } from "../screens/Start";
import { Game } from "../screens/Game";
import { Stack } from 'expo-router';


const stack = createNativeStackNavigator();

// default homescreen to be shown
export default function HomeScreen() {
  return (
    <App />
  );
  
  <App />;
}

