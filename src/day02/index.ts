import run from "aocrunner";

import {
  string as S,
  readonlyArray,
  array as A,
  function as F,
  monoid,
  number as N,
  map,
  string,
} from "fp-ts";

const parseInput = (rawInput: string) =>
  F.pipe(
    rawInput,
    S.trim,
    S.split("\n"),
    readonlyArray.toArray,
    A.map(F.flow(S.trim, S.split(" "), readonlyArray.toArray)),
  );

const simpleStrategyScoreMap = new Map<string, number>([
  ["A,X", 3 + 1],
  ["A,Y", 6 + 2],
  ["A,Z", 0 + 3],
  ["B,X", 0 + 1],
  ["B,Y", 3 + 2],
  ["B,Z", 6 + 3],
  ["C,X", 6 + 1],
  ["C,Y", 0 + 2],
  ["C,Z", 3 + 3],
]);

const winLoseStrategyScoreMap = new Map<string, number>([
  ["A,X", 0 + 3],
  ["A,Y", 3 + 1],
  ["A,Z", 6 + 2],
  ["B,X", 0 + 1],
  ["B,Y", 3 + 2],
  ["B,Z", 6 + 3],
  ["C,X", 0 + 2],
  ["C,Y", 3 + 3],
  ["C,Z", 6 + 1],
]);

const calculateScore = (
  scoreMap: Map<string, number>,
): ((rounds: string[][]) => number) =>
  F.flow(
    A.map((round) => round.join()),
    A.map((round) => map.lookup(string.Eq)(round, scoreMap)),
    A.compact,
    monoid.concatAll(N.MonoidSum),
  );

const part1 = (rawInput: string) => {
  const input = parseInput(rawInput);

  return calculateScore(simpleStrategyScoreMap)(input);
};

const part2 = (rawInput: string) => {
  const input = parseInput(rawInput);

  return calculateScore(winLoseStrategyScoreMap)(input);
};

run({
  part1: {
    tests: [
      {
        input: `A Y
B X
C Z`,
        expected: 15,
      },
    ],
    solution: part1,
  },
  part2: {
    tests: [
      {
        input: `A Y
B X
C Z`,
        expected: 12,
      },
    ],
    solution: part2,
  },
  trimTestInputs: true,
  onlyTests: false,
});
