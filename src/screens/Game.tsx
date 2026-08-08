import {
  ActivityIndicator,
  Alert,
  Image,
  Platform,
  ImageURISource,
  StyleSheet,
  View,
} from 'react-native';
import React, { useState, useEffect, useCallback, useRef } from 'react';

import { move, movableSquares, isSolved } from '../utils/puzzle';
import  { Board } from '../components/Board';
import { Button } from '../components/Button';
import { PuzzleType } from '../components/Board';
import Preview from '../components/Preview';
import Stats from '../components/Stats';
import configureTransition from '../utils/configureTransition';

const State = {
  LoadingImage: 'LoadingImage',
  WillTransitionIn: 'WillTransitionIn',
  RequestTransitionOut: 'RequestTransitionOut',
  WillTransitionOut: 'WillTransitionOut',
};

export interface GameState {
  transitionState: string,
  moves: number,
  elapsed: number,
  previousMove?: number,
  image?: ImageURISource
}

export interface GameProps {
  puzzle: PuzzleType
  image: ImageURISource
  onChange: (newPuzzle: PuzzleType) => void
  onQuit: () => void
}

// Game Screen component
export function Game({
  puzzle,
  image,
  onChange,
  onQuit
}: GameProps) {
  // reference to capture the interval Id
  // A ref binds to a lifecycle of component, not prone to rerenderings
  // also not deleted like a normal local variable (else timer is set
  // again and the timer value races)
  const intervalRef = useRef<ReturnType<typeof setInterval>| null>(null);
  const [ gameState, setGameState ] = useState<GameState>({
    transitionState: image ? State.WillTransitionIn : State.LoadingImage,
    moves: 0,
    elapsed: 0,
  });

  console.log("Game state ", gameState.transitionState);

  // unpacking gamestate
  const { size } = puzzle;
  const { transitionState, moves, elapsed, previousMove } = gameState;

  // side-effects
  useEffect(() => {
    // configure transition to WillTransitionIn
    if (image && transitionState === State.LoadingImage){
      configureTransition(() => {
        setGameState((prev: GameState) => ({
          ...prev,
          transitionState: State.WillTransitionIn 
        }));
      })
    }
  }, []);

  // wrapping callbacks with useCallback to memoize values
  const handleBoardTransitionIn = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    intervalRef.current = setInterval(() => {
      setGameState((prev: GameState) => (
        {...prev, elapsed: prev.elapsed + 1})
      );
    }, 1000);
  }, []);

  const handleBoardTransitionOut = useCallback(async () => {
    await configureTransition(() => {
      setGameState((prev: GameState) => ({
        ...prev,
        transitionState: State.WillTransitionOut
      }));
    });

    onQuit();
  }, []);

  const requestTransitionOut = useCallback(() => {
    if (intervalRef.current){
      clearInterval(intervalRef.current);
    }

    setGameState(
      (prev: GameState) => ({
        ...prev,
        transitionState: State.RequestTransitionOut
      }));
  }, [intervalRef]);

  const handlePressQuit = useCallback(() => {
    if (Platform.OS === "web"){
      const confirmed = window.confirm(`Do you want to quit and lose progress on this puzzle?`);
      if (confirmed) {
        requestTransitionOut();
      } else {
        return;
      }
    } else {
      Alert.alert(
        'Quit',
        'Do you want to quit and lose progress on this puzzle?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Quit',
            style: 'destructive',
            onPress: requestTransitionOut,
          },
        ],
      )}}, [requestTransitionOut]);


  const handlePressSquare = useCallback((square: number) => {
    const { moves } = gameState;

    if (!movableSquares(puzzle).includes(square)) return;

    const updated = move(puzzle, square);

    setGameState((prev: GameState) => ({ 
      ...prev, 
      moves: moves + 1, 
      previousMove: square,
    }));

    onChange(updated);

    if (isSolved(updated)) {
      requestTransitionOut();
    }
  }, [puzzle]);

  // render UI
  return (
    transitionState !== State.WillTransitionOut && (
      <View style={styles.container}>
        {transitionState === State.LoadingImage && (
          <ActivityIndicator size={'large'} color={'rgba(255,255,255,0.5)'} />
        )}
        {transitionState !== State.LoadingImage && (
          <View style={styles.centered}>
            <View style={styles.header}>
              <Preview image={image} boardSize={size} />
              <Stats moves={moves} time={elapsed} />
            </View>
            <Board
              puzzle={puzzle}
              image={image}
              previousMove={previousMove}
              teardown={transitionState === State.RequestTransitionOut}
              onMoveSquare={handlePressSquare}
              onTransitionOut={handleBoardTransitionOut}
              onTransitionIn={handleBoardTransitionIn}
            />
            <Button title={'Quit'} onPress={handlePressQuit} />
          </View>
        )}
      </View>
    )
  );
}

// styles for the component
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  centered: {
    flex: 1,
    justifyContent: 'space-around',
    alignItems: 'center',
    marginBottom: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingLeft: 10,
    paddingRight: 16,
    alignSelf: 'stretch',
  },
});
