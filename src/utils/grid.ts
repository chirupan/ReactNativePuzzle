import { Dimensions, PixelRatio } from 'react-native';

export const itemMargin = 3;
export const containerPadding = 3;

/**
 * Calculate the container size.
 *
 * @returns {number, number} The width, height of thegrid
 */
export function calculateContainerSize() {
  return {
    "width": Dimensions.get("window").width - 700,
    "height": Dimensions.get("window").height - 10
  }
}

/**
 * Calculate the width, height of each item, based on column count
 *
 * @param {number} size The size of grid (i.e. 3x3, 4x4)
 * @returns {number} The width, height of each item within the grid
 */
export function calculateItemSize(gridSize: number) {
  const {width, height} = calculateContainerSize();
  return {
    "itemWidth": (width -
      containerPadding * gridSize -
      itemMargin * (gridSize - 1)) /
      gridSize,
    "itemHeight": (height -
      containerPadding * gridSize -
      itemMargin * (gridSize - 1)) /
      gridSize
  }
}

/**
 * Calculate the position of each item
 *
 * @param {number} columns The number of columns
 * @param {number} index The index of the item
 * @returns {{top: number, left: number}} The item's position
 */
export function calculateItemPosition(columns: number, index: number) {
  const {itemWidth, itemHeight } = calculateItemSize(columns);

  return {
    top:
      containerPadding + Math.floor(index / columns) * 
        (itemHeight + itemMargin),
    left:
      containerPadding + Math.floor(index % columns) * (itemWidth + itemMargin),
  };
}
