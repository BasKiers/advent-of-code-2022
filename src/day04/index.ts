import run from "aocrunner";

import {
  string as S,
  readonlyArray as REA,
  nonEmptyArray as NEA,
  array as A,
  function as F,
  monoid,
  number,
} from "fp-ts";

const parseInput = (rawInput: string) =>
  F.pipe(
    rawInput,
    S.trim,
    S.split("\n"),
    REA.toArray,
    A.map(
      F.flow(
        S.trim,
        S.split(","),
        REA.toArray,
        A.map(
          F.flow(S.split("-"), REA.toArray, A.map(parseInt), ([start, end]) =>
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

  const intersectionLengths = F.pipe(input, toIntersectionLengths);
  const minTaskLengths = F.pipe(
    input,
    A.map(
      F.flow(
        NEA.map((a) => a.length),
        (lengths) => Math.min(...lengths),
      ),
    ),
  );
  const fullyIntersectedRanges = F.pipe(
    A.zipWith(intersectionLengths, minTaskLengths, (a, b) => a === b),
    A.filter(Boolean),
    (intersections) => intersections.length,
  );

  return fullyIntersectedRanges;
};

const part2 = (rawInput: string) => {
  const input = parseInput(rawInput);

  const intersectedRanges = F.pipe(
    input,
    toIntersectionLengths,
    A.filter(Boolean),
    (intersections) => intersections.length,
  );

  return intersectedRanges;
};

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
