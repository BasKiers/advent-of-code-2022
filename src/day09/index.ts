import run from "aocrunner";

import {
  string as S,
  readonlyArray,
  array as A,
  function as F,
  number as N,
  nonEmptyArray as NEA,
  ord,
} from "fp-ts";

const parseInput = (rawInput: string) =>
  F.pipe(
    rawInput,
    S.trim,
    S.split("\n"),
    readonlyArray.map(F.flow(S.trim, S.split(" "))),
    readonlyArray.reduce([] as [string, number][], (acc, [str, num]) => {
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
      a: [number, number],
      b: [number, number],
    ) => [number, number],
  ) =>
  (
    coordinates: NEA.NonEmptyArray<[number, number]>,
    newCoordinate: [number, number],
  ): NEA.NonEmptyArray<[number, number]> =>
    F.pipe(
      coordinates,
      NEA.head,
      (lastCoordinate) => [zipCoordinates(lastCoordinate, newCoordinate)],
      NEA.concat(coordinates),
    );

const getCoordinatesForMovements = (
  movements: [string, number][],
): [number, number][] => {
  return F.pipe(
    movements,
    A.chain(getDeltasForMovement),
    A.reduce(
      [[0, 0]] as NEA.NonEmptyArray<[number, number]>,
      calculateNextCoordinate(([x1, y1], [x2, y2]) => [x1 + x2, y1 + y2]),
    ),
    A.reverse,
  );
};

const getCoordinatesForFollower = (
  coordinates: [number, number][],
): [number, number][] =>
  F.pipe(
    coordinates,
    A.reduce(
      [[0, 0]] as NEA.NonEmptyArray<[number, number]>,
      calculateNextCoordinate(([x1, y1], [x2, y2]) => {
        const xDiff = x2 - x1;
        const yDiff = y2 - y1;
        if (Math.abs(xDiff) <= 1 && Math.abs(yDiff) <= 1) {
          return [x1, y1];
        }
        const newVal = F.flow(
          ord.clamp(N.Ord)(-1, 1),
          (a) => (b: number) => a + b,
        );
        return [newVal(xDiff)(x1), newVal(yDiff)(y1)];
      }),
    ),
    A.reverse,
    A.dropLeft(1),
  );

const getUniqueCoordinateCount = (coordinates: [number, number][]): number =>
  F.pipe(
    coordinates,
    A.map(([x, y]) => `x${x}y${y}`),
    (locationNames) => new Set(locationNames),
    (locationSet) => new Array(...locationSet.values()).length,
  );

const part1 = (rawInput: string) => {
  const input = parseInput(rawInput);

  const headCoordinates = getCoordinatesForMovements(input);
  const followerCoordinates = getCoordinatesForFollower(headCoordinates);
  const uniqueCoordinates = getUniqueCoordinateCount(followerCoordinates);

  return uniqueCoordinates;
};

const part2 = (rawInput: string) => {
  const input = parseInput(rawInput);

  let headCoordinates = getCoordinatesForMovements(input);

  const tailCoordinates = F.pipe(
    NEA.range(1, 9),
    NEA.reduce(headCoordinates, (coordinates) =>
      getCoordinatesForFollower(coordinates),
    ),
  );

  const uniqueCoordinates = getUniqueCoordinateCount(tailCoordinates);

  return uniqueCoordinates;
};

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
  onlyTests: false,
});
