import run from "aocrunner";

import {
  string as S,
  readonlyArray,
  array as A,
  function as F,
  number as N,
  either as E,
  nonEmptyArray as NEA,
  option as O,
  set,
  boolean,
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
        S.split(" -> "),
        readonlyArray.toArray,
        A.map(
          F.flow(
            S.split(","),
            readonlyArray.toArray,
            A.map(parseInt),
            ([x, y]): [number, number] => [x, y],
          ),
        ),
      ),
    ),
  );

const getLineLocations = (
  start: [number, number],
  end: [number, number],
): [number, number][] =>
  F.pipe(
    start,
    A.zip(end),
    A.map(
      F.flow(([c1, c2]) =>
        c1 <= c2 ? NEA.range(c1, c2) : A.reverse(NEA.range(c2, c1)),
      ),
    ),
    ([xRange, yRange]) =>
      F.pipe(
        NEA.range(0, Math.max(xRange.length, yRange.length) - 1),
        A.map((index): [number, number] => [
          xRange[index % xRange.length],
          yRange[index % yRange.length],
        ]),
      ),
  );

const getLocationKey = ([x, y]: [number, number]) => `${x},${y}`;

const toRockLocations = (edges: [number, number][][]): [number, number][] =>
  F.pipe(
    edges,
    A.map(
      A.reduce([] as [number, number][], (locations, end) =>
        A.concat(
          F.pipe(
            locations,
            A.last,
            O.map((start) => getLineLocations(start, end)),
            O.map(A.dropLeft(1)),
            O.getOrElse(() => [end]),
          ),
        )(locations),
      ),
    ),
    A.flatten,
  );

const toLargestY = (locations: [number, number][]): number =>
  F.pipe(
    locations,
    A.map(([, y]) => y),
    A.sort(N.Ord),
    A.last,
    O.map((y) => y + 1),
    O.getOrElse(() => 0),
  );

const getNextSandLocation = (
  isFree: (l: [number, number]) => boolean,
  abyss: number,
) => {
  const getNextSandLocation = (sand: [number, number]): [number, number] =>
    F.pipe(
      sand,
      E.left,
      E.orElse(([x, y]) =>
        F.pipe(
          [x, y + 1] as [number, number],
          O.fromPredicate(isFree),
          E.fromOption((): [number, number] => [x, y]),
        ),
      ),
      E.orElse(([x, y]) =>
        F.pipe(
          [x - 1, y + 1] as [number, number],
          O.fromPredicate(isFree),
          E.fromOption((): [number, number] => [x, y]),
        ),
      ),
      E.orElse(([x, y]) =>
        F.pipe(
          [x + 1, y + 1] as [number, number],
          O.fromPredicate(isFree),
          E.fromOption((): [number, number] => [x, y]),
        ),
      ),
      E.chain((location) =>
        F.pipe(
          location,
          O.fromPredicate(([, y]) => y < abyss),
          E.fromOption(() => location),
        ),
      ),
      E.swap,
      E.getOrElse(getNextSandLocation),
    );
  return getNextSandLocation([500, 0]);
};

const locationExists = (
  map1: { has: (k: string) => boolean },
  map2: { has: (k: string) => boolean },
) =>
  F.flow(
    getLocationKey,
    E.left,
    E.orElse(
      F.flow(
        E.fromPredicate(
          (k) => map1.has(k),
          (k) => k,
        ),
      ),
    ),
    E.orElse(
      F.flow(
        E.fromPredicate(
          (k) => map2.has(k),
          (k) => k,
        ),
      ),
    ),
    E.isLeft,
  );

const getSandLocationsWhile =
  (testFn: (newSandLocation: [number, number], abyss: number) => boolean) =>
  (rockLocations: [number, number][]): [number, number][] => {
    const abyss = toLargestY(rockLocations);
    const rockLocationSet = F.pipe(
      rockLocations,
      A.map(getLocationKey),
      set.fromArray(S.Ord),
    );

    const sandLocationMap: Map<string, [number, number]> = new Map();
    let sand: [number, number];
    do {
      sand = getNextSandLocation(
        locationExists(rockLocationSet, sandLocationMap),
        abyss,
      );
      sandLocationMap.set(getLocationKey(sand), sand);
    } while (testFn(sand, abyss));

    return [...sandLocationMap.values()];
  };

const part1 = (rawInput: string) => {
  const input = parseInput(rawInput);

  return F.pipe(
    input,
    toRockLocations,
    getSandLocationsWhile(([, y], abyss) => y !== abyss),
    A.size,
    (size) => size - 1,
  );
};

const part2 = (rawInput: string) => {
  const input = parseInput(rawInput);

  return F.pipe(
    input,
    toRockLocations,
    getSandLocationsWhile(([, y]) => y !== 0),
    A.size,
  );
};

run({
  part1: {
    tests: [
      {
        input: `498,4 -> 498,6 -> 496,6
503,4 -> 502,4 -> 502,9 -> 494,9
      `,
        expected: 24,
      },
    ],
    solution: part1,
  },
  part2: {
    tests: [
      {
        input: `498,4 -> 498,6 -> 496,6
      503,4 -> 502,4 -> 502,9 -> 494,9
      `,
        expected: 93,
      },
    ],
    solution: part2,
  },
  trimTestInputs: true,
  onlyTests: false,
});
