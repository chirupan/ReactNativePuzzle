import { PuzzleType } from "../components/Board";
/**
 * Creates an array containing integers from 0 up to `max`.
 *
 * @param {number} max
 * @returns {number[]}
 */
function range(max: number) {
  const array = [];

  for (let i = 0; i < max; i++) {
    array[i] = i;
  }

  return array;
}

/**
 * @typedef {{size: number, board: number[], empty: number}} Puzzle
 */

/**
 * Creates a new puzzle object.
 *
 * @param {number} size The length & width of the board.
 * @returns {Puzzle} The new puzzle state.
 */
export function createPuzzle(size: number) {
  // board contains array of indices
  const board = range(size * size);

  let puzzle: PuzzleType = {
    size,
    board,
    // empty is the square which should be empty
    // empty square can only be until second last row
    empty: Math.floor(Math.random() * (size * size - 1)),
  };

  const shuffledPuzzle = shuffleBoard(puzzle);

  return shuffledPuzzle;
}

/**
 * Shuffles the puzzle board.
 *
 * @param {Puzzle} puzzle
 * @returns {Puzzle} Shuffled puzzle.
 */
function shuffleBoard(puzzle: PuzzleType) {
  let previous: number | null = null;

  for (let i = 0; i < 1000; i++) {
    const moves = movableSquares(puzzle).filter(square => square !== previous);
    const square = moves[Math.floor(Math.random() * (moves.length - 1))];

    // eslint-disable-next-line no-param-reassign
    puzzle = move(puzzle, square);
    previous = square;
  }
  console.log("Shuffled puzzle: ", puzzle);
  return puzzle;
}

/**
 * Finds the squares adjacent to the empty square.
 *
 * @param {Puzzle} puzzle
 * @returns {number[]} Possible squares to move.
 */
export function movableSquares(puzzle: PuzzleType): number[] {
  const { size, board, empty } = puzzle;

  const emptyIndex = getIndex(puzzle, empty);
  // handle null values
  if (emptyIndex === -1 || !board){
    return [];
  }

  const adjacent = [  
    emptyIndex - size,
    emptyIndex + size,
    emptyIndex % size !== 0 ? emptyIndex - 1 : null,
    emptyIndex % size !== size - 1 ? emptyIndex + 1 : null,
  ]
  // index is number is a type-guard usually used
  // to return elements of type number
  .filter((index): index is number => 
      index !== null && index >= 0 && index < size * size)
  .map(index => board[index]);
  console.log("Adjacent: ", adjacent);

  return adjacent;
}

/**
 * Returns the direction a piece can be moved.
 *
 * @param {Puzzle} puzzle
 * @param {number} square
 * @returns {string} The available direction to move.
 */
export function availableMove(puzzle: PuzzleType, square: number) {
  const { size, empty, board } = puzzle;
  console.log("Square : ", square);
  console.log("Puzzle: ", puzzle);

  if (!puzzle || !empty){
    console.log("Returning none!!");
    return 'none';
  }
  // here the square represents each individual square
  // i.e. image portion rendered inside a box
  // getIndex() retrieves the index of the puzzle square
  const squareIndex = getIndex(puzzle, square);
  const emptyIndex = getIndex(puzzle, empty);
  console.log("Square Index: ", squareIndex);
  console.log("Square from index: ", board && board[squareIndex]);
  console.log("Empty Index: ", emptyIndex);
  // check if the square is among the movableSquares (i.e. 4 squares adjoining the)
  const canMove = movableSquares(puzzle).includes(square);
  console.log("canMove: ", canMove);

  if (canMove && squareIndex - size === emptyIndex) return 'up';
  if (canMove && squareIndex + size === emptyIndex) return 'down';
  if (canMove && squareIndex - 1 === emptyIndex) return 'left';
  if (canMove && squareIndex + 1 === emptyIndex) return 'right';

  return 'none';
}

/**
 * Finds the index of a square. &&
 *
 * @param {Puzzle} puzzle
 * @param {number} square
 * @returns {number} Index of the square
 */
export function getIndex(puzzle: PuzzleType, square?: number): number {
  const { board } = puzzle;
  if (square === undefined){
    return -1;
  }
  return board?.indexOf(square) ?? -1;
}

/**
 * Swaps a square with the empty square.
 * Returns the new puzzle object
 * @param {Puzzle} puzzle
 * @param {number} square
 * @returns {Puzzle} The updated puzzle state.
 */
export function move(puzzle: PuzzleType, square: number) {
  const { board, empty } = puzzle;
  if (!board || !empty){
    return puzzle
  }

  const squareIndex = getIndex(puzzle, square);
  const emptyIndex = getIndex(puzzle, empty);
  // returns a copy of board into copy (deep copy)
  const copy = board && board.slice();
  copy[emptyIndex!] = board && board[squareIndex!];
  copy[squareIndex!] = board && board[emptyIndex!];

  return {
    ...puzzle,
    board: copy,
  };
}

/**
 * Returns true if the puzzle board has been solved.
 *
 * @param {Puzzle} puzzle
 * @returns {boolean} This puzzle is solved.
 */
export function isSolved(puzzle: PuzzleType) {
  const { board } = puzzle;

  return board && board.every((square, index) => square === index);
}

/**
 * Prints the puzzle board to the console.
 *
 * @param {Puzzle} puzzle
 */
export function print(puzzle: PuzzleType) {
  const { size, board } = puzzle;

  for (let i = 0; i < size; i++) {
    console.log(board && board.slice(i * size, (i + 1) * size).join(', '));
  }
}
