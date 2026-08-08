import { Image, StyleSheet } from 'react-native';
// file-imports
import logo from '../../assets/images/logo.png';

// component to show log
export function Logo() {
  return <Image style={styles.image} source={logo} />;
}

const styles = StyleSheet.create({
  image: {
    width: null,
    height: null,
    resizeMode: 'contain',
    aspectRatio: 285 / 84,
  },
});
