import run from "aocrunner";

import {
  string as S,
  readonlyArray as ROA,
  nonEmptyArray as NEA,
  array as A,
  function as F,
  option as O,
  monoid,
  number,
} from "fp-ts";

const parseInput = (rawInput: string) =>
  F.pipe(
    rawInput,
    S.trim,
    S.split("\n"),
    ROA.toArray,
    A.map(
      F.flow(
        S.trim,
        S.split(","),
        ROA.toArray,
        A.map(
          F.flow(S.split("-"), ROA.toArray, A.map(parseInt), ([start, end]) =>
            NEA.range(start, end),
          ),
        ),
        NEA.fromArray,
      ),
    ),
    A.compact,
  );

const monoidIntersection: monoid.Monoid<number[]> = {
  concat: (a, b) => A.intersection(number.Eq)(a, b),
  empty: [],
};

const toIntersectionLengths: (
  arrays: NEA.NonEmptyArray<number[]>[],
) => number[] = A.map(
  F.flow(
    NEA.concatAll(monoidIntersection),
    (intersection) => intersection.length,
  ),
);

const part1 = (rawInput: string) => {
  const input = parseInput(rawInput);

  return F.pipe(
    input,
    toIntersectionLengths,
    (intersections) =>
      A.zipWith(intersections, input, (a, [b1, b2]) =>
        F.pipe(
          Math.min(b1.length, b2.length),
          O.fromPredicate((b) => b === a),
        ),
      ),
    A.compact,
    A.size,
  );
};

const part2 = (rawInput: string) =>
  F.pipe(
    rawInput,
    parseInput,
    toIntersectionLengths,
    A.filter(Boolean),
    A.size,
  );

run({
  part1: {
    tests: [
      {
        input: `2-4,6-8
2-3,4-5
5-7,7-9
2-8,3-7
6-6,4-6
2-6,4-8`,
        expected: 2,
      },
    ],
    solution: part1,
  },
  part2: {
    tests: [
      {
        input: `2-4,6-8
2-3,4-5
5-7,7-9
2-8,3-7
6-6,4-6
2-6,4-8`,
        expected: 4,
      },
    ],
    solution: part2,
  },
  trimTestInputs: true,
  onlyTests: false,
});
