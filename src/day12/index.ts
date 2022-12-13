import run from "aocrunner";

import {
  string as S,
  number as N,
  nonEmptyArray as NEA,
  readonlyArray,
  array as A,
  function as F,
  option as O,
  ord,
  set,
  map,
} from "fp-ts";
import chalk from "chalk";

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

const positionOrd = ord.tuple(N.Ord, N.Ord);
const sizeOrd: ord.Ord<[string, [[number, number], number]]> = {
  equals: ([, [, first]], [, [, second]]) => first === second,
  compare: ([, [, first]], [, [, second]]) =>
    first < second ? -1 : first > second ? 1 : 0,
};

const getPathKey = (arr: number[]) => arr.join();

const getPrintView =
  (puzzle: PuzzleState) =>
  (visited: Set<string>, costs: Map<string, [[number, number], number]>) =>
    console.log(
      F.pipe(
        puzzle.heightMap,
        A.mapWithIndex((y, row) =>
          F.pipe(
            row,
            A.mapWithIndex((x) => {
              if (positionOrd.equals([x, y], puzzle.end)) {
                return chalk.blue(
                  String(puzzle.heightMap[y][x]).padStart(2, " "),
                );
              } else if (visited.has(getPathKey([x, y]))) {
                return chalk.green(
                  String(puzzle.heightMap[y][x]).padStart(2, " "),
                );
              } else if (costs.has(getPathKey([x, y]))) {
                return chalk.white(
                  String(puzzle.heightMap[y][x]).padStart(2, " "),
                );
              }
              return chalk.red(String(puzzle.heightMap[y][x]).padStart(2, " "));
            }),
            (row) => row.join(" "),
          ),
        ),
        (view) => view.join("\n\n").concat("\n\n"),
      ),
    );

const PRINT_VIEW_ENABLED = false;

const getShortestPath = (
  puzzle: PuzzleState,
  visited: Set<string> = new Set(),
  costs: Map<string, [[number, number], number]> = new Map([
    [getPathKey(puzzle.start), [puzzle.start, 0]],
  ]),
): O.Option<number> => {
  const printView = getPrintView(puzzle);

  let shortestPath: O.Option<number> = O.none;
  let nextNode: O.Option<[string, [[number, number], number]]>;
  do {
    nextNode = F.pipe(
      costs,
      map.toArray(S.Ord),
      A.sort(sizeOrd),
      A.lookup(0),
      O.chain((node) => {
        const [key, [[x, y], cost]] = node;
        if (PRINT_VIEW_ENABLED) {
          printView(visited, costs);
        }
        if (positionOrd.equals(puzzle.end, [x, y])) {
          shortestPath = O.some(cost);
          return O.none;
        }
        visited = set.insert(S.Eq)(key)(visited);
        costs = F.pipe(
          [
            [x - 1, y],
            [x + 1, y],
            [x, y - 1],
            [x, y + 1],
          ] as [number, number][],
          A.filter(
            ([px, py]) =>
              py >= 0 &&
              py < puzzle.heightMap.length &&
              px >= 0 &&
              px < puzzle.heightMap[py].length &&
              puzzle.heightMap[py][px] - puzzle.heightMap[y][x] <= 1 &&
              !visited.has(getPathKey([px, py])),
          ),
          A.map(([px, py]): [string, [[number, number], number]] => [
            getPathKey([px, py]),
            [[px, py], cost + 1],
          ]),
          (entries) =>
            new Map([
              ...Array.from(costs.entries()).filter(
                ([costKey]) => costKey !== key,
              ),
              ...entries,
            ]),
        );
        return O.some(node);
      }),
    );
  } while (O.isSome(nextNode));

  return shortestPath;
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
