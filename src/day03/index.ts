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

const toIntersectionScoreTotal: (
  intersections: NEA.NonEmptyArray<string[]>[],
) => number = F.flow(
  A.map(NEA.concatAll(monoidIntersection)),
  A.map(A.lookup(0)),
  A.compact,
  A.map(strToScore),
  monoid.concatAll(N.MonoidSum),
);

const part1 = (rawInput: string) =>
  F.pipe(
    rawInput,
    parseInput,
    A.map((str) => A.splitAt(str.length / 2)(str)),
    toIntersectionScoreTotal,
  );

const part2 = (rawInput: string) =>
  F.pipe(rawInput, parseInput, A.chunksOf(3), toIntersectionScoreTotal);

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
