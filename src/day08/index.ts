import run from "aocrunner";

import {
  string as S,
  readonlyArray,
  array as A,
  function as F,
  nonEmptyArray as NEA,
  option as O,
  number as N,
  boolean,
  monoid,
} from "fp-ts";

const parseInput = (rawInput: string) =>
  F.pipe(
    rawInput,
    S.trim,
    S.split("\n"),
    readonlyArray.toArray,
    A.map(F.flow(S.trim, S.split(""), readonlyArray.toArray, A.map(parseInt))),
  );

const toTreesInLine =
  (map: number[][]) =>
  ([x, y]: number[]): number[][] =>
    [
      F.pipe(
        NEA.range(0, y),
        A.dropRight(1),
        A.reverse,
        A.map((y1) => map[y1][x]),
      ),
      F.pipe(
        NEA.range(y, map.length - 1),
        NEA.tail,
        A.map((y1) => map[y1][x]),
      ),
      F.pipe(
        NEA.range(0, x),
        A.dropRight(1),
        A.reverse,
        A.map((x1) => map[y][x1]),
      ),
      F.pipe(
        NEA.range(x, map[0].length - 1),
        NEA.tail,
        A.map((x1) => map[y][x1]),
      ),
    ];

const toIsBlockedFromView =
  (map: number[][]) =>
  ([x, y]: number[]): boolean =>
    F.pipe(
      [x, y],
      toTreesInLine(map),
      A.map(A.findIndex((height) => height >= map[y][x])),
      A.every(O.isSome),
    );

const toLineOfSight =
  (map: number[][]) =>
  ([x, y]: number[]): number[] =>
    F.pipe(
      [x, y],
      toTreesInLine(map),
      A.map((trees) =>
        F.pipe(
          trees,
          A.findIndex((height) => height >= map[y][x]),
          O.map((index) => index + 1),
          O.getOrElse(() => trees.length),
        ),
      ),
    );

const toCoordinateTuples = (map: any[][]): [number, number][] =>
  F.pipe(
    NEA.range(0, map.length - 1),
    NEA.map((y) =>
      F.pipe(
        NEA.range(0, map[0].length - 1),
        A.map((x): [number, number] => [x, y]),
      ),
    ),
    A.flatten,
  );

const part1 = (rawInput: string) => {
  const map = parseInput(rawInput);

  const visibleTrees = F.pipe(
    map,
    toCoordinateTuples,
    A.filter(F.flow(toIsBlockedFromView(map), boolean.BooleanAlgebra.not)),
    A.size,
  );

  return visibleTrees;
};

const part2 = (rawInput: string) => {
  const map = parseInput(rawInput);

  const bestViewScore = F.pipe(
    map,
    toCoordinateTuples,
    A.map(F.flow(toLineOfSight(map), monoid.concatAll(N.MonoidProduct))),
    A.sort(N.Ord),
    A.last,
    O.getOrElse(() => 0),
  );

  return bestViewScore;
};

run({
  part1: {
    tests: [
      {
        input: `30373
25512
65332
33549
35390`,
        expected: 21,
      },
    ],
    solution: part1,
  },
  part2: {
    tests: [
      {
        input: `30373
25512
65332
33549
35390`,
        expected: 8,
      },
    ],
    solution: part2,
  },
  trimTestInputs: true,
  onlyTests: false,
});
