import run from "aocrunner";

import {
  string as S,
  number as N,
  readonlyArray,
  array as A,
  function as F,
  option as O,
  ord,
  set,
  map,
  boolean,
} from "fp-ts";

interface PuzzleState {
  start: [number, number];
  end: [number, number];
  heightMap: number[][];
}

const parseInput = (rawInput: string) =>
  F.pipe(
    rawInput,
    S.trim,
    S.split("\n"),
    readonlyArray.toArray,
    A.mapWithIndex((y, row) =>
      F.pipe(
        row,
        S.trim,
        S.split(""),
        readonlyArray.toArray,
        A.map((char) => char.charCodeAt(0)),
        A.reduceWithIndex(
          { heightMap: [] } as Partial<Pick<PuzzleState, "start" | "end">> & {
            heightMap: number[];
          },
          (x, state, charCode) => {
            switch (charCode) {
              case 83:
                state.start = [x, y];
                state.heightMap.push(0);
                return state;
              case 69:
                state.end = [x, y];
                state.heightMap.push(25);
                return state;
              default:
                state.heightMap.push(charCode - 97);
                return state;
            }
          },
        ),
      ),
    ),
    A.reduce(
      { start: [0, 0], end: [0, 0], heightMap: [] } as PuzzleState,
      (state, { start, end, heightMap }) => ({
        start: start ?? state.start,
        end: end ?? state.end,
        heightMap: [...state.heightMap, heightMap],
      }),
    ),
  );

const sizeOrd: ord.Ord<[string, [[number, number], number]]> = {
  equals: ([, [, first]], [, [, second]]) => first === second,
  compare: ([, [, first]], [, [, second]]) =>
    first < second ? -1 : first > second ? 1 : 0,
};

const getPathKey = (arr: number[]) => arr.join();

const getShortestPath = (
  puzzle: PuzzleState,
  visited: Set<string> = new Set(),
  costs: Map<string, [[number, number], number]> = new Map([
    [getPathKey(puzzle.start), [puzzle.start, 0]],
  ]),
): O.Option<number> => {
  const endKey = getPathKey(puzzle.end);
  do {
    costs = F.pipe(costs, map.toArray(S.Ord), A.sort(sizeOrd), (entries) =>
      F.pipe(
        entries,
        A.lookup(0),
        O.map(([key, [[x, y], cost]]) => {
          visited = set.insert(S.Eq)(key)(visited);
          return F.pipe(
            [
              [x - 1, y],
              [x + 1, y],
              [x, y - 1],
              [x, y + 1],
            ] as [number, number][],
            A.filter(
              F.flow(
                O.of,
                O.filter(([, py]) => py >= 0 && py < puzzle.heightMap.length),
                O.filter(
                  ([px, py]) => px >= 0 && px < puzzle.heightMap[py].length,
                ),
                O.filter(
                  ([px, py]) =>
                    puzzle.heightMap[py][px] - puzzle.heightMap[y][x] <= 1,
                ),
                O.filter(
                  F.flow(
                    getPathKey,
                    (k) => visited.has(k),
                    boolean.BooleanAlgebra.not,
                  ),
                ),
                O.isSome,
              ),
            ),
            A.map(([px, py]): [string, [[number, number], number]] => [
              getPathKey([px, py]),
              [[px, py], cost + 1],
            ]),
            A.concat(entries),
            (entries) => new Map(entries),
            map.deleteAt(S.Eq)(key),
          );
        }),
        O.getOrElse(() => new Map<string, [[number, number], number]>()),
      ),
    );
  } while (
    F.pipe(
      costs,
      O.of,
      O.filter(F.flow(map.isEmpty, boolean.BooleanAlgebra.not)),
      O.filter(F.flow(map.member(S.Eq)(endKey), boolean.BooleanAlgebra.not)),
      O.isSome,
    )
  );

  return F.pipe(
    costs,
    map.lookup(S.Eq)(endKey),
    O.map(([, cost]) => cost),
  );
};

const part1 = (rawInput: string) => {
  const puzzle = parseInput(rawInput);

  const shortestPath = F.pipe(
    puzzle,
    getShortestPath,
    O.getOrElse(() => Number.MAX_VALUE),
  );

  return shortestPath;
};

const part2 = (rawInput: string) => {
  const puzzle = parseInput(rawInput);

  const startPositions = F.pipe(
    puzzle.heightMap,
    A.mapWithIndex((y, row) =>
      F.pipe(
        row,
        A.mapWithIndex((x, value): [[number, number], number] => [
          [x, y],
          value,
        ]),
      ),
    ),
    A.flatten,
    A.filter(([, value]) => value === 0),
    A.map(([position]) => position),
  );

  const shortestPath = F.pipe(
    startPositions,
    A.map((start) => F.pipe({ ...puzzle, start }, getShortestPath)),
    A.compact,
    A.sort(N.Ord),
    A.lookup(0),
    O.getOrElse(() => Number.MAX_VALUE),
  );

  return shortestPath;
};

run({
  part1: {
    tests: [
      {
        input: `Sabqponm
abcryxxl
accszExk
acctuvwj
abdefghi`,
        expected: 31,
      },
    ],
    solution: part1,
  },
  part2: {
    tests: [
      {
        input: `Sabqponm
abcryxxl
accszExk
acctuvwj
abdefghi`,
        expected: 29,
      },
    ],
    solution: part2,
  },
  trimTestInputs: true,
  onlyTests: false,
});
