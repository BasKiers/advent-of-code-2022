import run from "aocrunner";

import {
  string as S,
  readonlyArray,
  array as A,
  function as F,
  string,
  monoid,
  number as N,
  nonEmptyArray as NEA,
} from "fp-ts";

const parseInput = (rawInput: string) =>
  F.pipe(
    rawInput,
    S.trim,
    S.split("\n"),
    readonlyArray.toArray,
    A.map(F.flow(S.trim, S.split(""), readonlyArray.toArray)),
  );

let strToScore = (str: string): number => (str.charCodeAt(0) - 38) % 58;

const monoidIntersection: monoid.Monoid<string[]> = {
  concat: (a, b) => A.intersection(string.Eq)(a, b),
  empty: [],
};

const toIntersectionScoreTotal: (intersections: string[][]) => number = F.flow(
  A.map(F.flow(A.lookup(0))),
  A.compact,
  A.map(strToScore),
  monoid.concatAll(N.MonoidSum),
);

const part1 = (rawInput: string) => {
  const input = parseInput(rawInput);

  const score = F.pipe(
    input,
    A.map((str): [string[], string[]] => [
      str.slice(0, str.length / 2),
      str.slice(str.length / 2),
    ]),
    A.map(F.flow(NEA.concatAll(monoidIntersection))),
    toIntersectionScoreTotal,
  );

  return score;
};

const part2 = (rawInput: string) => {
  const input = parseInput(rawInput);

  const score = F.pipe(
    input,
    A.chunksOf(3),
    A.map(F.flow(NEA.concatAll(monoidIntersection))),
    toIntersectionScoreTotal,
  );

  return score;
};

run({
  part1: {
    tests: [
      {
        input: `vJrwpWtwJgWrhcsFMMfFFhFp
jqHRNqRjqzjGDLGLrsFMfFZSrLrFZsSL
PmmdzqPrVvPwwTWBwg
wMqvLMZHhHMvwLHjbvcjnnSBnvTQFn
ttgJtRGJQctTZtZT
CrZsJsPPZsGzwwsLwLmpwMDw`,
        expected: 157,
      },
    ],
    solution: part1,
  },
  part2: {
    tests: [
      {
        input: `vJrwpWtwJgWrhcsFMMfFFhFp
jqHRNqRjqzjGDLGLrsFMfFZSrLrFZsSL
PmmdzqPrVvPwwTWBwg
wMqvLMZHhHMvwLHjbvcjnnSBnvTQFn
ttgJtRGJQctTZtZT
CrZsJsPPZsGzwwsLwLmpwMDw`,
        expected: 70,
      },
    ],
    solution: part2,
  },
  trimTestInputs: true,
  onlyTests: false,
});
