import { Animated, StyleSheet, View } from 'react-native';
import React, { useState, useEffect, useCallback } from 'react';
// file-based imports
import { Button } from '../components/Button';
import { Logo } from '../components/Logo';
import { Toggle } from '../components/Toggle';
import configureTransition from '../utils/configureTransition';
import sleep from '../utils/sleep';

const State = {
  Launching: 'Launching',
  WillTransitionIn: 'WillTransitionIn',
  WillTransitionOut: 'WillTransitionOut',
};

const BOARD_SIZES = [3, 4, 5, 6];

// Start Props
export interface StartProps {
  onChangeSize: (size: number) => void
  onStartGame: () => void
  size: number
}

export function Start({
  onChangeSize,
  onStartGame,
  size
}: StartProps)  {

  const [ startState, setStartState ] = useState<string>(State.Launching);

  let toggleOpacity = new Animated.Value(0);
  let buttonOpacity = new Animated.Value(0);

  // styles
  const toggleStyle = { opacity: toggleOpacity };
  const buttonStyle = { opacity: buttonOpacity };

  // sideeffects
  useEffect(() => {
    const sideEffect = async () => {
      await sleep(500);
      // animate
      await configureTransition(() => {
        setStartState( State.WillTransitionIn );
      });

      Animated.timing(toggleOpacity, {
        toValue: 1,
        duration: 500,
        delay: 500,
        useNativeDriver: true,
      }).start();

      Animated.timing(buttonOpacity, {
        toValue: 1,
        duration: 500,
        delay: 1000,
        useNativeDriver: true,
      }).start();
    };

    sideEffect();
  }, []);

  const handlePressStart = useCallback(async () => {
    console.log("In handlePressStart");
    await configureTransition(() => {
      setStartState(State.WillTransitionOut);
    });

    onStartGame();
  }, [onStartGame]);

  // render the UI
  return (
      startState !== State.WillTransitionOut && (
        <View style={styles.container}>
          <View style={styles.logo}>
            <Logo />
          </View>
          {startState !== State.Launching && (
            <View style={[toggleStyle, {marginTop: 50}]}>
              <Toggle
                options={BOARD_SIZES}
                value={size}
                onChange={onChangeSize}
              />
            </View>
          )}
          {startState !== State.Launching && (
            <View style={[buttonStyle, {marginTop: 50}]}> 
              <Button title={'Start Game'} onPress={handlePressStart} />
            </View>
          )}
        </View>
      )
    );
}

// styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    height: "auto",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 20,
  },
  logo: {
    height: "auto",
    alignSelf: 'center',
    paddingHorizontal: 40
  },
});
