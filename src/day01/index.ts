import run from "aocrunner";

import {
  string as S,
  readonlyArray as ROA,
  array as A,
  number as N,
  function as F,
  option as O,
  monoid,
} from "fp-ts";

const parseInput = (rawInput: string) =>
  F.pipe(
    rawInput,
    S.trim,
    S.split("\n\n"),
    ROA.toArray,
    A.map(F.flow(S.trim, S.split("\n"), ROA.toArray, A.map(parseInt))),
  );

const toSortedCalories = F.flow(
  A.map(monoid.concatAll(N.MonoidSum)),
  A.sort(N.Ord),
);

const part1 = (rawInput: string) =>
  F.pipe(
    rawInput,
    parseInput,
    toSortedCalories,
    A.last,
    O.getOrElse(() => 0),
  );

const part2 = (rawInput: string) =>
  F.pipe(
    rawInput,
    parseInput,
    toSortedCalories,
    A.takeRight(3),
    monoid.concatAll(N.MonoidSum),
  );

run({
  part1: {
    tests: [
      {
        input: `1000
2000
3000

4000

5000
6000

7000
8000
9000

10000`,
        expected: 24000,
      },
    ],
    solution: part1,
  },
  part2: {
    tests: [
      {
        input: `1000
2000
3000

4000

5000
6000

7000
8000
9000

10000`,
        expected: 45000,
      },
    ],
    solution: part2,
  },
  trimTestInputs: true,
  onlyTests: false,
});
