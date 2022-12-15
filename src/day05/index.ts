import run from "aocrunner";

import {
  string as S,
  readonlyArray,
  nonEmptyArray as NEA,
  array as A,
  function as F,
  option as O,
  monoid,
} from "fp-ts";

const monoidZip: monoid.Monoid<string[][]> = {
  concat: (a, b) => F.pipe(A.zip(a, b), A.map(A.flatten)),
  empty: [],
};

const parseInput = (rawInput: string) =>
  F.pipe(
    rawInput,
    S.split("\n\n"),
    readonlyArray.toArray,
    A.map(
      F.flow(
        S.split("\n"),
        readonlyArray.toArray,
        A.map(
          F.flow(
            S.split("    "),
            readonlyArray.toArray,
            A.chain(F.flow(S.split(" "), readonlyArray.toArray)),
          ),
        ),
      ),
    ),
    ([board, moves]): [string[][], number[][]] => [
      F.pipe(
        board,
        A.dropRight(1),
        A.map(A.map((e) => [e])),
        NEA.fromArray,
        O.map(NEA.concatAll(monoidZip)),
        O.getOrElse(() => [] as string[][]),
        A.map(A.filter(Boolean)),
        A.map(A.map((str) => str.charAt(1))),
      ),
      F.pipe(
        moves,
        A.map(
          F.flow(
            A.chunksOf(2),
            (foo) => foo,
            A.map(([, num]): number => parseInt(num)),
          ),
        ),
      ),
    ],
  );

const getNextBoardState =
  (grabModifier: (taken: string[]) => string[] = (t) => t) =>
  (board: string[][], [move, from, to]: number[]): string[][] => {
    const [taken, left] = F.pipe(
      board,
      A.lookup(from - 1),
      O.map(F.flow(A.splitAt(move), ([t, l]) => [grabModifier(t), l])),
      O.getOrElse((): string[][] => [[], []]),
    );
    return F.pipe(
      board,
      A.mapWithIndex((i, row) => {
        if (i === from - 1) {
          return left;
        } else if (i === to - 1) {
          return taken.concat(row);
        }
        return row;
      }),
    );
  };

const part1 = (rawInput: string) => {
  const [board, moves] = parseInput(rawInput);

  return F.pipe(
    moves,
    A.reduce(board, getNextBoardState(A.reverse)),
    A.map(A.lookup(0)),
    A.compact,
    (arr) => arr.join(""),
  );
};

const part2 = (rawInput: string) => {
  const [board, moves] = parseInput(rawInput);

  return F.pipe(
    moves,
    A.reduce(board, getNextBoardState()),
    A.map(A.lookup(0)),
    A.compact,
    (arr) => arr.join(""),
  );
};

run({
  part1: {
    tests: [
      {
        input: `    [D]    
[N] [C]    
[Z] [M] [P]
 1   2   3 

move 1 from 2 to 1
move 3 from 1 to 3
move 2 from 2 to 1
move 1 from 1 to 2`,
        expected: "CMZ",
      },
    ],
    solution: part1,
  },
  part2: {
    tests: [
      {
        input: `    [D]    
[N] [C]    
[Z] [M] [P]
 1   2   3 

move 1 from 2 to 1
move 3 from 1 to 3
move 2 from 2 to 1
move 1 from 1 to 2`,
        expected: "MCD",
      },
    ],
    solution: part2,
  },
  trimTestInputs: false,
  onlyTests: true,
});
