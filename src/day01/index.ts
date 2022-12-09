import run from "aocrunner";

import {
  string as S,
  readonlyArray as REA,
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
    REA.toArray,
    A.map(
      F.flow(
        S.trim,
        S.split("\n"),
        REA.toArray,
        A.map((str: string) => parseInt(str)),
      ),
    ),
  );

const toSortedCalories = F.flow(
  A.map(monoid.concatAll(N.MonoidSum)),
  A.sort(N.Ord),
);

const part1 = (rawInput: string) => {
  const input = parseInput(rawInput);

  const answer = F.pipe(
    input,
    toSortedCalories,
    A.last,
    O.getOrElse(() => 0),
  );

  return answer;
};

const part2 = (rawInput: string) => {
  const input = parseInput(rawInput);

  const answer = F.pipe(
    input,
    toSortedCalories,
    A.takeRight(3),
    monoid.concatAll(N.MonoidSum),
  );

  return answer;
};

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
