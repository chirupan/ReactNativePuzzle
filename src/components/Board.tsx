import {
  Animated,
  Image,
  StyleSheet,
  View,
  Dimensions,
  Easing,
  ImagePropsBase,
  PanResponder, 
  GestureResponderEvent, 
  PanResponderGestureState,
  GestureResponderHandlers
} from 'react-native';
import { useState, useEffect, useCallback, useRef } from 'react';
// file-based imports
import { availableMove, getIndex } from '../utils/puzzle';
import {
  calculateItemSize,
  itemMargin,
  calculateItemPosition,
  calculateContainerSize,
} from '../utils/grid';
import { Draggable } from './Draggable';
import clamp from '../utils/clamp';

// Puzzle props
export interface PuzzleType {
  size: number,
  empty?: number,
  board?: number[]
}

// Board props
export interface BoardProps {
  puzzle: PuzzleType
  teardown: boolean
  image: ImagePropsBase
  previousMove?: number
  onMoveSquare: (x: number) => void
  onTransitionIn: () => void
  onTransitionOut: () => void
}
// state enum
const State = {
  WillTransitionIn: 'WillTransitionIn',
  DidTransitionIn: 'DidTransitionIn',
  DidTransitionOut: 'DidTransitionOut',
};

// Board state
export interface BoardState {
  transitionState: string
}

// Square shape (i.e.)
interface Square {
  top: Animated.AnimatedValue
  left: Animated.AnimatedValue
  scale: Animated.AnimatedValue
}

interface SquareType {
  top: number
  left: number
}

export function Board({
  puzzle,
  teardown,
  image,
  previousMove,
  onMoveSquare,
  onTransitionIn,
  onTransitionOut
}: BoardProps) {
  // calculate the container size and style
  const containerStyle = { ...calculateContainerSize() };
  
  // state
  const [ boardState, setBoardState ] = useState<BoardState>({
    transitionState: State.WillTransitionIn
  });

  // unpacking
  const { size, board, empty } = puzzle;
  let animatedValues: Square[] = [];
  const height = Dimensions.get('window').height;
  // intialize the squares (each value is representing a number denoting
  // what portion of the image is to be rendered inside each grid)
  board && board.forEach((square, index) => {
    const { top, left} = calculateItemPosition(size, index);
    // all values are animated
    // Animation is always w.r.t size/scale/position aspects of a component
    // initial values for the square animations
    const topLocation = (
      (boardState.transitionState === State.WillTransitionIn) ? top + height : top
    ); 
    animatedValues[square] = {
      // this is used purely for animation
      // i.e. placed outside the screen so that when animation 
      // plays they will flow to their correct position and 
      // will be shown
      top : new Animated.Value(topLocation),
      left: new Animated.Value(left),
      scale: new Animated.Value(1)
    }
  });

  // function to animate all squares (i.e. animate the position of squares)
  const animateAllSquares = async (visible: boolean) => {
    const { size, board } = puzzle;
    // The Dimensions api is used to get the width/height of the window.
    const height = Dimensions.get('window').height;

    const animations = board && board.map((square, index) => {
      // get the top cordinate of the element
      const { top } = calculateItemPosition(size, index);

      return Animated.timing(animatedValues[square].top, {
        // the animated values are out of screen if not visible
        toValue: visible ? top : top + height,
        delay: 800 * (index / board.length),
        duration: 400,
        easing: visible ? Easing.out(Easing.ease) : Easing.in(Easing.ease),
        useNativeDriver: true,
      });
    });
    // start the animations
    // this line resolves automatically after a set time-duration 
    // the resolve is like a callback once the animations are completed
    if (!animations){
      return;
    }
    return new Promise(resolve => Animated.parallel(animations).start(resolve));
  }

  // function to update square position
  const updateSquarePosition = async(
    puzzle: PuzzleType, 
    square: number, 
    index: number
  ) => {
    const { size } = puzzle;

    const { top, left } = calculateItemPosition(size, index);
    // animating both top and left positions simultaneously
    const animations = [
      Animated.spring(animatedValues[square].top, {
        toValue: top,
        friction: 20,
        tension: 200,
        useNativeDriver: true,
      }),
      Animated.spring(animatedValues[square].left, {
        toValue: left,
        friction: 20,
        tension: 200,
        useNativeDriver: true,
      }),
    ];

    return new Promise(resolve => Animated.parallel(animations).start(resolve));
  }

  // handler when a square is touched
  const handleTouchStart = useCallback((square: number) => {
    Animated.spring(animatedValues[square].scale, {
      toValue: 1.1,
      friction: 20,
      tension: 200,
      useNativeDriver: true,
    }).start();
  }, [animatedValues]);

  // handler when a square is moved
  const handleTouchMove = useCallback((
    square: number, 
    index: number, 
    { top, left }: SquareType
  ) => {

    const {itemWidth, itemHeight} = calculateItemSize(size);
    const move = availableMove(puzzle, square);

    const { top: initialTop, left: initialLeft } = calculateItemPosition(
      size,
      index,
    );

    const distanceX = itemWidth + itemMargin;
    const distanceY = itemHeight + itemMargin;

    const clampedTop = clamp(
      // initial value
      top,
      move === 'up' ? -distanceY : 0,
      move === 'down' ? distanceY : 0,
    );

    const clampedLeft = clamp(
      // initial value
      left,
      move === 'left' ? -distanceX : 0,
      move === 'right' ? distanceX : 0,
    );

    animatedValues[square].left.setValue(initialLeft + clampedLeft);
    animatedValues[square].top.setValue(initialTop + clampedTop);
  }, [puzzle, animatedValues]);

  // handler when the touch is released
  const handleTouchEnd = useCallback(async(square: number, index: number, 
    { top, left }: SquareType) => {

    const {itemWidth, itemHeight} = calculateItemSize(size);
    const move = availableMove(puzzle, square);
    console.log("Available move: ", move);
    // scale the square back to its original scale of 1
    Animated.spring(animatedValues[square].scale, {
      toValue: 1,
      friction: 20,
      tension: 200,
      useNativeDriver: true,
    }).start();

    if (
      // here top, left => offset positions and not wrt to root
      (move === 'up' && top < -itemHeight / 2) ||
      (move === 'down' && top > itemHeight / 2) ||
      (move === 'left' && left < -itemWidth / 2) ||
      (move === 'right' && left > itemWidth / 2)
    ) {
      // call-back to be invoked when the square is moved
      console.log("Moving square");
      onMoveSquare(square);
    } else {
      // if cannot be moved just show the animation at 
      // the initial place itself
      await updateSquarePosition(puzzle, square, index);
    }
  }, [animatedValues]);

  // callback to render a square
  const renderSquare = (square: number, index: number) => {
    if (square === empty) return null;
    // const { transitionState } = boardState;
    const { itemWidth, itemHeight } = calculateItemSize(size);
    return (
      <Draggable
        key={index}
        enabled={boardState.transitionState === State.DidTransitionIn}
        onTouchStart={() => handleTouchStart(square)}
        onTouchMove={(offset: SquareType) => handleTouchMove(square, index, offset)}
        onTouchEnd={(offset: SquareType) => handleTouchEnd(square, index, offset)}
      >
        {
          ({handlers, dragging}) => {
            const itemStyle = {
              position: 'absolute',
              width: itemWidth,
              height: itemHeight,
              overflow: 'hidden',
              transform: [
                { translateX: animatedValues[square].left },
                { translateY: animatedValues[square].top },
                { scale: animatedValues[square].scale },
              ],
              zIndex: dragging ? 1 : 0
            } as const;
            
            const imageStyle = {
              position: 'absolute',
              width: itemWidth * size + itemMargin * (size - 1),
              height: itemHeight * size + itemMargin * (size - 1),
              transform: [
                {
                  // the translateX shifts in the left to offset the image
                  translateX:
                    -Math.floor(square % size) * (itemWidth + itemMargin),
                },
                {
                  // that translateY shifts in the up direction to offset the image based on the
                  // square value provided
                  translateY:
                    -Math.floor(square / size) * (itemHeight + itemMargin),
                },
              ],
            } as const;

            return (
              <Animated.View {...handlers} style={itemStyle}>
                <Image style={imageStyle} source={image} />
              </Animated.View>
            );
          }
        }
      </Draggable>
    );
  }

  // side-effect
  useEffect(() => {
    const updateUI = async() => {
      // teardown
      if (teardown){
        // set the animations out of screen
        console.log("animate all square to false");
        await animateAllSquares(false);

        // set the board state
        setBoardState({
          transitionState: State.DidTransitionOut
        });

        // invoke the transition out method
        onTransitionOut();
        return;
      }
      // update the squares in board
      // if (previousMove){
      //   await updateSquarePosition(
      //     puzzle,
      //     previousMove,
      //     getIndex(puzzle, previousMove)
      //   );
      //   return;
      // }
      // animate all squares
      console.log("animate all squares to true");
      await animateAllSquares(true);

      // change the state once animation is done
      setBoardState({transitionState: State.DidTransitionIn});

      // invoke the transitionIn method
      // start the timer
      onTransitionIn();
    }
    updateUI();
  }, [teardown, previousMove]);

  return (
    <View style={[styles.container, containerStyle]}>
      {boardState.transitionState !== State.DidTransitionOut &&
        // board is an array of squares and 
        // renderSquare is used to render each square
        board && board.map(
          (square: number, index: number) => renderSquare(square, index)
        )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 6,
    backgroundColor: '#1F1E2A',
    marginBottom: 10,
  },
  title: {
    fontSize: 24,
    color: '#69B8FF',
  },
});
