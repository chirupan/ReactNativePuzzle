import * as Device from 'expo-device';
import React, { Image, ImageURISource, View, Platform, StyleSheet, ScrollView } from "react-native";
import { useState, useEffect } from 'react';
// file based imports
import { Start } from '../screens/Start';
import { Game } from '../screens/Game';
import { PuzzleType } from '@/components/Board';
import { getRandomImage } from '@/utils/api';
import { createPuzzle } from '@/utils/puzzle';

export interface AppState {
  // onChange: (newPuzzle: PuzzleType) => void
  // onQuit: () => void
  puzzle?: PuzzleType
  image?: ImageURISource
  // although size is included in puzzle
  // it might be needed when no instance of puzzle is set
  // i.e. when showing up the start screen
  size: number
}

export function App() {
  // puzzle should be defined only when the user clicks on start game button
  // this is because the puzzle needs to know what size to use for the board
  // let it have a default size of 3
  const [appState, setAppState] = useState<AppState>({ size: 3 });
  // handler to change the size of the puzzle
  const handleChangeSize = (size: number) =>  {
    setAppState({
      ...appState,
      size: size
    })
  };

  // handler to start the game
  const handleStartGame = async () => {
    if (appState?.size){
      // create a puzzle
      await loadImage();
      console.log("In handleStartGame ");
      const puzzle = createPuzzle(appState.size);
      setAppState((previousState: AppState) => ({
        ...previousState,
        puzzle: puzzle
      }));
    }
  }

  // handler to change the game
  const handleChange = (newPuzzle: PuzzleType) => {
    setAppState((prev: AppState) => ({
      ...prev,
      puzzle: newPuzzle
    }));
  }

  // handler to quit the game
  const handleQuitGame = () => {
    console.log("Quitting in App");
    setAppState((prev: AppState) => ({
      ...prev,
      puzzle: undefined,
      image: undefined,
    }));
  }

  // callback to load the image
  const loadImage = async(): Promise<void> => {
    try{
      const  img = await getRandomImage();
      // set the state
      setAppState({
        ...appState,
        image: img
      });
    }catch(err){
      console.log(`Error loading the image: ${err}`);
    }
  }

  // side-effect
  useEffect(() => {
    loadImage();
  }, []);

  // UI
  return (
    <ScrollView style={[styles.background]}>
      {!appState?.puzzle && (
        <Start
          onChangeSize={handleChangeSize}
          onStartGame={handleStartGame}
          // choosing default size as 3
          size={appState?.size}
        />
        )
      }

      {appState?.puzzle && appState?.image && (
        <Game 
          puzzle={appState.puzzle}
          image={appState.image}
          onChange={handleChange}
          onQuit={handleQuitGame}
        />
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  container: {
    flex: 1,
    display: "flex"
  }
});

