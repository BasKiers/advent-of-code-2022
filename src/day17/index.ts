import run from "aocrunner";

import {
  string as S,
  readonlyArray,
  nonEmptyArray as NEA,
  array as A,
  function as F,
  option as O,
  either as E,
} from "fp-ts";

const parseInput = (rawInput: string) =>
  F.pipe(rawInput, S.trim, S.split(""), readonlyArray.toArray);

const pieces = F.pipe(
  [
    [0b1111],
    [0b10, 0b111, 0b10],
    [0b100, 0b100, 0b111],
    [0b1, 0b1, 0b1, 0b1],
    [0b11, 0b11],
  ] as NEA.NonEmptyArray<NEA.NonEmptyArray<number>>,
  NEA.map(NEA.reverse),
);

const pieceBounds = F.pipe(pieces, NEA.map(A.reduce(0, (a, b) => a | b)));

type Board = NEA.NonEmptyArray<number>;

type Piece = {
  location: [number, number];
  pieceIndex: number;
  modifierIndex: number;
};

type State = {
  board: Board;
  trimmedHeight: number;
  uniqueStates: Map<string, [number, number]>;
  duplicate?: [[number, number], [number, number]];
  nextPiece: Piece;
};

const getInitialState = (): State => ({
  board: [0b1111111],
  trimmedHeight: -1,
  uniqueStates: new Map(),
  nextPiece: {
    location: [2, 4],
    pieceIndex: 0,
    modifierIndex: 0,
  },
});

const getNextPiece =
  (board: Board) =>
  ({ pieceIndex, modifierIndex }: Piece) =>
    F.pipe(
      pieceIndex,
      (i) => (i + 1) % pieces.length,
      (newIndex): Piece => ({
        location: [2, board.length + 3],
        pieceIndex: newIndex,
        modifierIndex,
      }),
    );

const addPosition =
  (
    board: Board,
    trimmedHeight: number,
    cycle: number,
    uniqueStates: State["uniqueStates"],
    modifierIndex: number,
  ) =>
  ({ pieceIndex, location: [x, y] }: Piece) =>
    F.pipe(
      pieces[pieceIndex],
      A.reduceWithIndex(board, (rowY, newBoard, pieceRow) =>
        F.pipe(
          newBoard,
          NEA.modifyAt(y + rowY, (row) => row | (pieceRow << x)),
          O.getOrElse(() => F.pipe(newBoard, A.append(pieceRow << x))),
        ),
      ),
      (newBoard) => {
        let isBlocked: number = 0b0;
        let isBlockedAgain: number = 0b0;
        return F.pipe(
          newBoard,
          NEA.reverse,
          A.takeLeftWhile((row) => {
            const res = isBlocked !== 0b1111111 || isBlockedAgain !== 0b1111111;
            isBlockedAgain = isBlockedAgain | (isBlocked & row);
            isBlocked = isBlocked | row;
            return res;
          }),
          A.reverse,
          NEA.fromArray,
          O.getOrElse(() => newBoard),
          (subBoard) => {
            const res: Pick<State, "board" | "trimmedHeight" | "duplicate"> = {
              board: subBoard,
              trimmedHeight: trimmedHeight + newBoard.length - subBoard.length,
            };
            const stateKey = `${pieceIndex}|${modifierIndex}|${subBoard.join(
              "",
            )}`;
            const curCycle: [number, number] = [
              cycle,
              trimmedHeight + newBoard.length,
            ];
            if (uniqueStates.has(stateKey)) {
              res.duplicate = [uniqueStates.get(stateKey)!, curCycle];
            }
            uniqueStates.set(stateKey, curCycle);

            return res;
          },
        );
      },
    );

const isFree =
  (board: Board) =>
  ({ location: [lx, ly], pieceIndex }: Piece) =>
    lx >= 0 &&
    pieceBounds[pieceIndex] << lx < 128 &&
    F.pipe(
      NEA.range(0, pieces[pieceIndex].length - 1),
      A.every((y) =>
        F.pipe(
          board,
          A.lookup(ly + y),
          O.filter((row) => (row & (pieces[pieceIndex][y] << lx)) !== 0),
          O.isNone,
        ),
      ),
    );

const simulateStoneDrop =
  (modifiers: string[]) =>
  (
    i: number,
    { board, trimmedHeight, nextPiece, uniqueStates }: State,
  ): State => {
    let movingPiece: E.Either<Piece, Piece> = E.right(nextPiece);
    do {
      movingPiece = F.pipe(
        movingPiece,
        E.map((piece) =>
          F.pipe(
            piece,
            ({ location: [x, y], modifierIndex, ...rest }): Piece =>
              F.pipe(
                modifiers[modifierIndex],
                O.fromPredicate((modifier) => modifier === "<"),
                O.match(
                  (): [number, number] => [x + 1, y],
                  (): [number, number] => [x - 1, y],
                ),
                (location) => ({
                  ...rest,
                  modifierIndex,
                  location,
                }),
              ),
            O.fromPredicate(isFree(board)),
            O.getOrElse(() => piece),
            (newPiece) => ({
              ...newPiece,
              modifierIndex: (newPiece.modifierIndex + 1) % modifiers.length,
            }),
          ),
        ),
        E.chain((piece) =>
          F.pipe(
            piece,
            ({ location: [x, y], ...rest }): Piece => ({
              ...rest,
              location: [x, y - 1],
            }),
            O.fromPredicate(isFree(board)),
            E.fromOption(() => piece),
          ),
        ),
      );
    } while (E.isRight(movingPiece));

    return F.pipe(
      movingPiece,
      E.swap,
      E.map((piece) =>
        F.pipe(
          piece,
          addPosition(
            board,
            trimmedHeight,
            i,
            uniqueStates,
            piece.modifierIndex,
          ),
          (updatedBoard) => ({
            ...updatedBoard,
            uniqueStates,
            nextPiece: getNextPiece(updatedBoard.board)(piece),
          }),
        ),
      ),
      E.getOrElse(() => ({
        board,
        trimmedHeight,
        uniqueStates,
        nextPiece,
      })),
    );
  };

const toHeightAfterCycles = (cycles: number) => (modifiers: string[]) => {
  let state = getInitialState();
  for (let cycle = 1; cycle <= cycles; cycle++) {
    state = simulateStoneDrop(modifiers)(cycle, state);

    // Performance hack to skip cycles once a duplication range is found
    if (state.duplicate) {
      const [[start, startHeight], [end, endHeight]] = state.duplicate;
      const cycleDelta = end - start;
      const skip = Math.floor((cycles - cycle) / cycleDelta);
      if (skip !== 0) {
        const heightDelta = endHeight - startHeight;
        state.trimmedHeight += heightDelta * skip;
        cycle += skip * cycleDelta;
      }
    }
  }
  return F.pipe(
    state,
    ({ board, trimmedHeight }) => board.length + trimmedHeight,
  );
};

const part1 = (rawInput: string) =>
  F.pipe(rawInput, parseInput, toHeightAfterCycles(2022));
const part2 = (rawInput: string) =>
  F.pipe(rawInput, parseInput, toHeightAfterCycles(1000000000000));

run({
  part1: {
    tests: [
      {
        input: `>>><<><>><<<>><>>><<<>>><<<><<<>><>><<>>`,
        expected: 3068,
      },
    ],
    solution: part1,
  },
  part2: {
    tests: [
      {
        input: `>>><<><>><<<>><>>><<<>>><<<><<<>><>><<>>`,
        expected: 1514285714288,
      },
    ],
    solution: part2,
  },
  trimTestInputs: true,
  onlyTests: false,
});
