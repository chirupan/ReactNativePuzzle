import {
  Animated,
  Easing,
  StyleSheet,
  TouchableWithoutFeedback,
 } from 'react-native';
import React, {useState, useEffect} from 'react';

const getValue = (pressed: boolean, disabled: boolean) => {
  const base = disabled ? 0.5 : 1;
  const delta = disabled ? 0.1 : 0.3;

  return pressed ? base - delta : base;
};

// props for Button
export interface ButtonProps {
  title: string,
  onPress: () => void,
  disabled?: boolean,
  height?: number,
  color?: string,
  fontSize?: number,
  borderRadius?: number
}

// state for Button
export interface ButtonState {
  pressed: boolean
}

export function Button({
  title, 
  onPress,
  // default values
  disabled = false, 
  height,
  color, 
  fontSize, 
  borderRadius
}: ButtonProps) {
    const [ buttonState, setButtonState ] = useState<ButtonState>({pressed: false})
    // inner component to animate
    let value = new Animated.Value(getValue(false, disabled));

    // side effect
    useEffect(() => {
      // P.N Animated.timing() will not cause the component
      // to re-render but will run the animation w/o re-rendering.
      // whole idea is to run animation without re-rendering as it is slow.
      // this will be run whenever the props i.e disabled or
      // state i.e pressed is changed as side-effect will be invoked
      // after painting the UI.
      Animated.timing(value, {
        duration: 200,
        toValue: getValue(buttonState.pressed, disabled),
        easing: Easing.out(Easing.quad),
        useNativeDriver: true
      }).start();
    })

    // event-handler when pressed in
    const handlePressIn = () => {
        setButtonState({ pressed: true });
    };

    // event-handler when pressed out
    const handlePressOut = () => {
      setButtonState({ pressed: false });
    };

    const animatedColor = value.interpolate({
      inputRange: [0, 1],
      outputRange: ['black', '#0CE1C2'],
    });

    const animatedScale = value.interpolate({
      inputRange: [0, 1],
      outputRange: [0.8, 1],
    });

    const containerStyle = {
      borderColor: animatedColor,
      borderRadius,
      height,
      // used to scale up or down the element
      transform: [{ scale: animatedScale }],
    };

    const titleStyle = {
      color: animatedColor,
      fontSize,
    };

    // ui
    // P.N when using Animated.value to render the UI
    // all the top-level components need to be wrapped
    // with Animated.View or Animated.Text tags
    return (
      <TouchableWithoutFeedback
        // triggers callback when pressed
        // also this is triggered right after the onPressOut
        onPress={onPress}
        // triggers callback for the time the user has clicked in
        onPressIn={handlePressIn}
        // triggers callback for the time when the user lifts
        // finger from the button
        onPressOut={handlePressOut}
      >
        <Animated.View style={[styles.container, containerStyle]}>
          <Animated.Text style={[styles.title, titleStyle]}>
            {title}
          </Animated.Text>
        </Animated.View>
      </TouchableWithoutFeedback>
    );
}


const styles = StyleSheet.create({
  container: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1F1E2A',
    borderWidth: 2,
  },
  title: {
    backgroundColor: 'transparent',
    fontSize: 24,
  },
});
