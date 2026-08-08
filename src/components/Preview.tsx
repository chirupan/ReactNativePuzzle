import { Image, StyleSheet, View, ImagePropsBase } from 'react-native';
// file-imports
import { calculateItemSize, calculateContainerSize, itemMargin } from '../utils/grid';

// Preview Props
export interface PreviewProps {
  image: ImagePropsBase,
  boardSize: number
}

// Preview component for showing the image
export default function Preview({ image, boardSize }: PreviewProps) {
  const {itemWidth} = calculateItemSize(boardSize);
  const scaledSize = itemWidth < 80 ? itemWidth * 0.8 + itemMargin : itemWidth * 0.5;
  // style for image (square image)
  const style = {
    width: scaledSize,
    height: scaledSize,
  };

  return (
    <View style={styles.container}>
      <Image style={[styles.image, style]} source={image} />
    </View>
  );
}
// styles
const styles = StyleSheet.create({
  container: {
    padding: 6,
    borderRadius: 6,
    backgroundColor: '#1F1E2A',
  },
  image: {
    resizeMode: 'contain',
  },
});
