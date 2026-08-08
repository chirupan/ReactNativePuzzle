import { 
  PanResponder, 
  GestureResponderEvent, 
  PanResponderGestureState,
  GestureResponderHandlers
} from 'react-native';
import { useState, ReactNode } from 'react';

// object to define location of item
export interface itemLocation {
  top: number
  left: number
}

// children props
export interface ChildrenProps {
  handlers: GestureResponderHandlers,
  dragging: boolean
}

// Draggable Props
export interface DraggableProps {
  children: (props: ChildrenProps) => ReactNode,
  // handlers
  onTouchStart: () => void,
  onTouchMove: (location: itemLocation) => void,
  onTouchEnd: (location: itemLocation) => void,
  enabled: boolean
}

// component that renders the draggable component
// it wraps a component with the panResponder view
// so that it can use the event handlers and provide the
// draggable functionality to the component.
export function Draggable({
  children,
  onTouchStart,
  onTouchMove,
  onTouchEnd,
  enabled
}: DraggableProps) {
  // state
  const [draggableState, setDraggableState] = useState<boolean>(false);

  // handlers
  // Should we become active when the user presses down on the square?
  const handleStartShouldSetPanResponder = () => enabled;

  // We were granted responder status! Let's update the UI
  const handlePanResponderGrant = () => {
    setDraggableState(true);
    // invoke the onTouchStart() method
    onTouchStart();
  };

  // Every time the touch moves
  const handlePanResponderMove = (
    e: GestureResponderEvent, 
    gestureState: PanResponderGestureState) => {
    // Keep track of how far we've moved in total (dx and dy)
    const offset = {
      top: gestureState.dy,
      left: gestureState.dx,
    };

    onTouchMove(offset);
  };

  // When the touch is lifted
  const handlePanResponderEnd = (
    e: GestureResponderEvent, 
    gestureState: PanResponderGestureState) => {

    const offset = {
      top: gestureState.dy,
      left: gestureState.dx,
    };

    setDraggableState(
      false
    );

    onTouchMove(offset);
    onTouchEnd(offset);
  };

  // create a panresponder object
  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: handleStartShouldSetPanResponder,
    onPanResponderGrant: handlePanResponderGrant,
    onPanResponderMove: handlePanResponderMove,
    onPanResponderRelease: handlePanResponderEnd,
    onPanResponderTerminate: handlePanResponderEnd,
  })

  // render the ui
  // Update children with the state of the drag
  return children({
    handlers: panResponder.panHandlers,
    dragging: draggableState,
  });

}
