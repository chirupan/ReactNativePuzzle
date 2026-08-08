import { LayoutAnimation, Platform, UIManager } from 'react-native';

export default function configureTransition(onConfigured = () => {}) {
  if (UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }
  // play animation on the next re-render
  const animation = LayoutAnimation.create(
    750,
    // type of animation to play (animationCurve)
    LayoutAnimation.Types.easeInEaseOut,
    // style to animate i.e opacity or scalexY
    LayoutAnimation.Properties.opacity
  );

  const promise = new Promise<void>(resolve => {
    // Workaround for missing LayoutAnimation callback support on Android
    if (Platform.OS === 'android') {
      LayoutAnimation.configureNext(animation);
      setTimeout(resolve, 750);
    } else {
      LayoutAnimation.configureNext(animation, () => resolve());
    }
  });
  // invoke some callback after playing the animation
  onConfigured();
  // the onConfigured() invokes the animation
  // and awaits for its completion. This is useful
  // as the animation runs on a native thread and if 
  // not awaited, JS code might run another animation quickly
  // and might not produce desirable affects on the UI.
  return promise;
}
