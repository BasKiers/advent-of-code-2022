import run from "aocrunner";

import {
  string as S,
  readonlyArray,
  array as A,
  function as F,
  nonEmptyArray as NEA,
  number as N,
  option as O,
  monoid,
  ord,
} from "fp-ts";

const parseInput = (rawInput: string) =>
  F.pipe(
    rawInput,
    S.trim,
    S.split("\n"),
    readonlyArray.toArray,
    A.map(
      F.flow(
        S.trim,
        S.split("="),
        readonlyArray.toArray,
        A.dropLeft(1),
        A.map((str) => str.match(/^[0-9-]+/)![0]),
        A.map(parseInt),
      ),
    ),
  );

const xOrd: ord.Ord<[number, number, number, number]> = {
  equals: ([x1], [x2]) => N.Ord.equals(x1, x2),
  compare: ([x1], [x2]) => N.Ord.compare(x1, x2),
};

const groupRanges: (
  as: [number, number, number, number][],
) => [number, number, number, number][] = A.chop((as) => {
  let max = as[0][0];
  return F.pipe(
    as,
    A.spanLeft(
      F.flow(
        O.of,
        O.filter(([start]) => max - start >= -1),
        O.map((an) => {
          max = Math.max(max, an[2]);
          return an;
        }),
        O.isSome,
      ),
    ),
    ({ init, rest }) => [
      F.pipe(
        A.head(init),
        O.map(([x, y]): [number, number, number, number] => [x, y, max, y]),
        O.getOrElse((): [number, number, number, number] => [0, 0, 0, 0]),
      ),
      rest,
    ],
  );
});

const mergeOverlappingRanges =
  (minVal: number = 0, maxVal: number = 4000000) =>
  (ranges: [number, number, number, number][]) =>
    F.pipe(
      ranges,
      A.sort(xOrd),
      A.filter(([x1, , x2]) => x2 > minVal && x1 < maxVal),
      groupRanges,
    );

const getClearPositions = (
  yStart: number,
  yEnd: number,
  excludeBeacons: boolean = false,
) =>
  F.flow(
    A.reduce(
      [] as [number, number, number, number][][],
      (ranges, [x1, y1, x2, y2]: number[]) => {
        const distance = Math.abs(x1 - x2) + Math.abs(y1 - y2);
        return F.pipe(
          NEA.range(yStart, yEnd),
          A.mapWithIndex((i, rangeY) =>
            F.pipe(
              rangeY,
              O.fromPredicate(
                (row) => y1 - distance <= row && y1 + distance >= row,
              ),
              O.filter((y) => !(excludeBeacons && x1 === x2 && y === y2)),
              O.map((y) =>
                A.append([
                  x1 -
                    distance +
                    Math.abs(y1 - y) +
                    (excludeBeacons && y === y2 && x2 < x1 ? 1 : 0),
                  y,
                  x1 +
                    distance -
                    Math.abs(y1 - y) -
                    (excludeBeacons && y === y2 && x2 > x1 ? 1 : 0),
                  y,
                ] as [number, number, number, number])(ranges[i] || []),
              ),
              O.getOrElse(() => ranges[i]),
            ),
          ),
        );
      },
    ),
    A.map(mergeOverlappingRanges()),
  );

const part1 = (rawInput: string) => {
  const input = parseInput(rawInput);
  const yLine = input.length > 30 ? 2000000 : 10;

  return F.pipe(
    input,
    getClearPositions(yLine, yLine, true),
    A.lookup(0),
    O.map(
      F.flow(
        A.map(([start, , end]) => Math.abs(end - start + 1)),
        monoid.concatAll(N.MonoidSum),
      ),
    ),
    O.getOrElse(() => 0),
  );
};

const part2 = (rawInput: string) => {
  const input = parseInput(rawInput);
  const maxVal = input.length > 30 ? 4000000 : 20;

  return F.pipe(
    input,
    getClearPositions(0, maxVal, false),
    A.findFirst((occupiedRanges) => occupiedRanges.length === 2),
    O.map(([[, , x, y]]) => (x + 1) * 4000000 + y),
    O.getOrElse(() => 0),
  );
};

run({
  part1: {
    tests: [
      {
        input: `Sensor at x=2, y=18: closest beacon is at x=-2, y=15
Sensor at x=9, y=16: closest beacon is at x=10, y=16
Sensor at x=13, y=2: closest beacon is at x=15, y=3
Sensor at x=12, y=14: closest beacon is at x=10, y=16
Sensor at x=10, y=20: closest beacon is at x=10, y=16
Sensor at x=14, y=17: closest beacon is at x=10, y=16
Sensor at x=8, y=7: closest beacon is at x=2, y=10
Sensor at x=2, y=0: closest beacon is at x=2, y=10
Sensor at x=0, y=11: closest beacon is at x=2, y=10
Sensor at x=20, y=14: closest beacon is at x=25, y=17
Sensor at x=17, y=20: closest beacon is at x=21, y=22
Sensor at x=16, y=7: closest beacon is at x=15, y=3
Sensor at x=14, y=3: closest beacon is at x=15, y=3
Sensor at x=20, y=1: closest beacon is at x=15, y=3
`,
        expected: 26,
      },
    ],
    solution: part1,
  },
  part2: {
    tests: [
      {
        input: `Sensor at x=2, y=18: closest beacon is at x=-2, y=15
Sensor at x=9, y=16: closest beacon is at x=10, y=16
Sensor at x=13, y=2: closest beacon is at x=15, y=3
Sensor at x=12, y=14: closest beacon is at x=10, y=16
Sensor at x=10, y=20: closest beacon is at x=10, y=16
Sensor at x=14, y=17: closest beacon is at x=10, y=16
Sensor at x=8, y=7: closest beacon is at x=2, y=10
Sensor at x=2, y=0: closest beacon is at x=2, y=10
Sensor at x=0, y=11: closest beacon is at x=2, y=10
Sensor at x=20, y=14: closest beacon is at x=25, y=17
Sensor at x=17, y=20: closest beacon is at x=21, y=22
Sensor at x=16, y=7: closest beacon is at x=15, y=3
Sensor at x=14, y=3: closest beacon is at x=15, y=3
Sensor at x=20, y=1: closest beacon is at x=15, y=3
      `,
        expected: 56000011,
      },
    ],
    solution: part2,
  },
  trimTestInputs: true,
  onlyTests: false,
});
