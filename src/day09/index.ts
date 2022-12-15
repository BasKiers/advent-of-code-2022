import run from "aocrunner";

import {
  string as S,
  readonlyArray as ROA,
  array as A,
  function as F,
  number as N,
  nonEmptyArray as NEA,
  option as O,
  ord,
  monoid,
  set,
} from "fp-ts";

const parseInput = (rawInput: string) =>
  F.pipe(
    rawInput,
    S.trim,
    S.split("\n"),
    ROA.map(F.flow(S.trim, S.split(" "))),
    ROA.reduce([] as [string, number][], (acc, [str, num]) => {
      acc.push([str, parseInt(num)]);
      return acc;
    }),
  );

const getDeltasForMovement = ([direction, amount]: [string, number]): [
  number,
  number,
][] => {
  switch (direction) {
    case "U":
      return new Array(amount).fill([0, 1]);
    case "D":
      return new Array(amount).fill([0, -1]);
    case "L":
      return new Array(amount).fill([-1, 0]);
    case "R":
      return new Array(amount).fill([1, 0]);
    default:
      return [];
  }
};

const calculateNextCoordinate =
  (
    zipCoordinates: (
      a: readonly [number, number],
      b: readonly [number, number],
    ) => readonly [number, number],
  ) =>
  (
    coordinates: NEA.NonEmptyArray<readonly [number, number]>,
    coordinateDelta: readonly [number, number],
  ): NEA.NonEmptyArray<readonly [number, number]> =>
    F.pipe(
      coordinates,
      NEA.head,
      (lastCoordinate) => [zipCoordinates(lastCoordinate, coordinateDelta)],
      NEA.concat(coordinates),
    );

const getCoordinatesForMovements = (
  movements: [string, number][],
): (readonly [number, number])[] => {
  return F.pipe(
    movements,
    A.chain(getDeltasForMovement),
    A.reduce(
      [[0, 0]] as NEA.NonEmptyArray<readonly [number, number]>,
      calculateNextCoordinate(monoid.tuple(N.MonoidSum, N.MonoidSum).concat),
    ),
    A.reverse,
  );
};

const getCoordinatesForFollower = (
  coordinates: (readonly [number, number])[],
): (readonly [number, number])[] =>
  F.pipe(
    coordinates,
    A.reduce(
      [[0, 0]] as NEA.NonEmptyArray<[number, number]>,
      calculateNextCoordinate((tail, head) =>
        F.pipe(
          ROA.zipWith(head, tail, (h, t) => h - t),
          O.fromPredicate(ROA.some((l) => Math.abs(l) > 1)),
          O.map(F.flow(ROA.map(ord.clamp(N.Ord)(-1, 1)))),
          O.map(([x, y]) =>
            monoid.tuple(N.MonoidSum, N.MonoidSum).concat([x, y], tail),
          ),
          O.getOrElse(() => tail),
        ),
      ),
    ),
    A.reverse,
    A.dropLeft(1),
  );

const getUniqueCoordinateCount = (
  coordinates: (readonly [number, number])[],
): number =>
  F.pipe(
    coordinates,
    A.map((c) => c.join(",")),
    set.fromArray(S.Eq),
    set.size,
  );

const part1 = (rawInput: string) =>
  F.pipe(
    rawInput,
    parseInput,
    getCoordinatesForMovements,
    getCoordinatesForFollower,
    getUniqueCoordinateCount,
  );

const part2 = (rawInput: string) =>
  F.pipe(
    rawInput,
    parseInput,
    getCoordinatesForMovements,
    (headCoordinates) =>
      NEA.reduce(headCoordinates, getCoordinatesForFollower)(NEA.range(1, 9)),
    getUniqueCoordinateCount,
  );

run({
  part1: {
    tests: [
      {
        input: `R 4
U 4
L 3
D 1
R 4
D 1
L 5
R 2`,
        expected: 13,
      },
    ],
    solution: part1,
  },
  part2: {
    tests: [
      {
        input: `R 5
U 8
L 8
D 3
R 17
D 10
L 25
U 20`,
        expected: 36,
      },
    ],
    solution: part2,
  },
  trimTestInputs: true,
  onlyTests: true,
});
