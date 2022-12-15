import run from "aocrunner";

import {
  string as S,
  readonlyArray,
  array as A,
  function as F,
  monoid,
  number as N,
  option as O,
  map,
} from "fp-ts";

const parseInput = (rawInput: string) =>
  F.pipe(rawInput, S.trim, S.split("\n"), readonlyArray.toArray);

const SCORE = {
  L: 0,
  D: 3,
  W: 6,
  ROCK: 1,
  PAPER: 2,
  SCISSORS: 3,
} as const;

const simpleStrategyScoreMap = new Map<string, number>([
  ["A X", SCORE.D + SCORE.ROCK],
  ["A Y", SCORE.W + SCORE.PAPER],
  ["A Z", SCORE.L + SCORE.SCISSORS],
  ["B X", SCORE.L + SCORE.ROCK],
  ["B Y", SCORE.D + SCORE.PAPER],
  ["B Z", SCORE.W + SCORE.SCISSORS],
  ["C X", SCORE.W + SCORE.ROCK],
  ["C Y", SCORE.L + SCORE.PAPER],
  ["C Z", SCORE.D + SCORE.SCISSORS],
]);

const winLoseStrategyScoreMap = new Map<string, number>([
  ["A X", SCORE.L + SCORE.SCISSORS],
  ["A Y", SCORE.D + SCORE.ROCK],
  ["A Z", SCORE.W + SCORE.PAPER],
  ["B X", SCORE.L + SCORE.ROCK],
  ["B Y", SCORE.D + SCORE.PAPER],
  ["B Z", SCORE.W + SCORE.SCISSORS],
  ["C X", SCORE.L + SCORE.PAPER],
  ["C Y", SCORE.D + SCORE.SCISSORS],
  ["C Z", SCORE.W + SCORE.ROCK],
]);

const toScore =
  (scoreMap: Map<string, number>) =>
  (round: string): O.Option<number> =>
    F.pipe(scoreMap, map.lookup(S.Eq)(round));

const part1 = (rawInput: string) =>
  F.pipe(
    rawInput,
    parseInput,
    A.map(toScore(simpleStrategyScoreMap)),
    A.compact,
    monoid.concatAll(N.MonoidSum),
  );

const part2 = (rawInput: string) =>
  F.pipe(
    rawInput,
    parseInput,
    A.map(toScore(winLoseStrategyScoreMap)),
    A.compact,
    monoid.concatAll(N.MonoidSum),
  );

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
