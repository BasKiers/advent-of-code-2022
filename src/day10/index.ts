import run from "aocrunner";

import {
  string as S,
  readonlyArray,
  array as A,
  function as F,
  option as O,
  nonEmptyArray as NEA,
} from "fp-ts";

const parseInput = (rawInput: string) =>
  F.pipe(
    rawInput,
    S.trim,
    S.split("\n"),
    readonlyArray.toArray,
    A.map(
      F.flow(
        S.trim,
        S.split(" "),
        readonlyArray.toArray,
        ([operation, amount]): [string, number] => [
          operation,
          parseInt(amount),
        ],
      ),
    ),
  );

const toRegisterValues: (operations: [string, number][]) => number[] = F.flow(
  A.reduce([[1]] as number[][], (cycles, [operation, amount]) => {
    const x = F.pipe(
      cycles,
      A.last,
      O.chain(A.last),
      O.getOrElse(() => 0),
    );
    switch (operation) {
      case "noop":
        return [...cycles, [x]];
      case "addx":
        return [...cycles, [x, x + amount]];
      default:
        return cycles;
    }
  }),
  A.flatten,
);

const part1 = (rawInput: string) => {
  const input = parseInput(rawInput);

  const answer = F.pipe(
    input,
    toRegisterValues,
    A.dropLeft(19),
    A.chunksOf(40),
    A.map(NEA.head),
    A.reduceWithIndex(0, (i, sum, value) => {
      const index = i * 40 + 20;
      return sum + value * index;
    }),
  );

  return answer;
};

const part2 = (rawInput: string) => {
  const input = parseInput(rawInput);

  const registerValues = F.pipe(input, toRegisterValues);

  const lines = F.pipe(
    A.zip(NEA.range(0, 239), registerValues),
    A.map(([cycle, position]) =>
      cycle % 40 >= position && cycle % 40 < position + 3 ? "#" : ".",
    ),
    A.chunksOf(40),
    A.map((arr) => arr.join("")),
    (arr) => arr.join("\n"),
  );

  console.log(lines);

  return lines;
};

run({
  part1: {
    tests: [
      {
        input: `addx 15
addx -11
addx 6
addx -3
addx 5
addx -1
addx -8
addx 13
addx 4
noop
addx -1
addx 5
addx -1
addx 5
addx -1
addx 5
addx -1
addx 5
addx -1
addx -35
addx 1
addx 24
addx -19
addx 1
addx 16
addx -11
noop
noop
addx 21
addx -15
noop
noop
addx -3
addx 9
addx 1
addx -3
addx 8
addx 1
addx 5
noop
noop
noop
noop
noop
addx -36
noop
addx 1
addx 7
noop
noop
noop
addx 2
addx 6
noop
noop
noop
noop
noop
addx 1
noop
noop
addx 7
addx 1
noop
addx -13
addx 13
addx 7
noop
addx 1
addx -33
noop
noop
noop
addx 2
noop
noop
noop
addx 8
noop
addx -1
addx 2
addx 1
noop
addx 17
addx -9
addx 1
addx 1
addx -3
addx 11
noop
noop
addx 1
noop
addx 1
noop
noop
addx -13
addx -19
addx 1
addx 3
addx 26
addx -30
addx 12
addx -1
addx 3
addx 1
noop
noop
noop
addx -9
addx 18
addx 1
addx 2
noop
noop
addx 9
noop
noop
noop
addx -1
addx 2
addx -37
addx 1
addx 3
noop
addx 15
addx -21
addx 22
addx -6
addx 1
noop
addx 2
addx 1
noop
addx -10
noop
noop
addx 20
addx 1
addx 2
addx 2
addx -6
addx -11
noop
noop
noop`,
        expected: 13140,
      },
    ],
    solution: part1,
  },
  part2: {
    tests: [
      {
        input: `addx 15
addx -11
addx 6
addx -3
addx 5
addx -1
addx -8
addx 13
addx 4
noop
addx -1
addx 5
addx -1
addx 5
addx -1
addx 5
addx -1
addx 5
addx -1
addx -35
addx 1
addx 24
addx -19
addx 1
addx 16
addx -11
noop
noop
addx 21
addx -15
noop
noop
addx -3
addx 9
addx 1
addx -3
addx 8
addx 1
addx 5
noop
noop
noop
noop
noop
addx -36
noop
addx 1
addx 7
noop
noop
noop
addx 2
addx 6
noop
noop
noop
noop
noop
addx 1
noop
noop
addx 7
addx 1
noop
addx -13
addx 13
addx 7
noop
addx 1
addx -33
noop
noop
noop
addx 2
noop
noop
noop
addx 8
noop
addx -1
addx 2
addx 1
noop
addx 17
addx -9
addx 1
addx 1
addx -3
addx 11
noop
noop
addx 1
noop
addx 1
noop
noop
addx -13
addx -19
addx 1
addx 3
addx 26
addx -30
addx 12
addx -1
addx 3
addx 1
noop
noop
noop
addx -9
addx 18
addx 1
addx 2
noop
noop
addx 9
noop
noop
noop
addx -1
addx 2
addx -37
addx 1
addx 3
noop
addx 15
addx -21
addx 22
addx -6
addx 1
noop
addx 2
addx 1
noop
addx -10
noop
noop
addx 20
addx 1
addx 2
addx 2
addx -6
addx -11
noop
noop
noop`,
        expected: [
          "##..##..##..##..##..##..##..##..##..##..",
          "###...###...###...###...###...###...###.",
          "####....####....####....####....####....",
          "#####.....#####.....#####.....#####.....",
          "######......######......######......####",
          "#######.......#######.......#######.....",
        ].join("\n"),
      },
    ],
    solution: part2,
  },
  trimTestInputs: true,
  onlyTests: false,
});
