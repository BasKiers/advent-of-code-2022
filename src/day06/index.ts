import run from "aocrunner";

import {
  string as S,
  readonlyArray,
  array as A,
  function as F,
  option as O,
  nonEmptyArray as NEA,
  semigroup,
  set,
} from "fp-ts";

const parseInput = (rawInput: string) =>
  F.pipe(rawInput, S.trim, S.split(""), readonlyArray.toArray);

const toWindows =
  (windowSize: number) =>
  <T>(arr: T[]): T[][] =>
    F.pipe(
      NEA.range(0, windowSize - 1),
      NEA.foldMap({
        concat: (a, b) => F.pipe(A.zip(a, b), A.map(A.flatten)),
      } as semigroup.Semigroup<T[][]>)((skip) =>
        F.pipe(arr, A.map(A.of), A.dropLeft(skip)),
      ),
    );

const toIndexAfterDistinctItems =
  (distinctItemCount: number) => (array: string[]) =>
    F.pipe(
      array,
      toWindows(distinctItemCount),
      A.findIndex(
        F.flow(
          set.fromArray(S.Eq),
          set.size,
          (uniqueElems) => uniqueElems === distinctItemCount,
        ),
      ),
      O.map((windowIndex) => windowIndex + distinctItemCount),
    );

const part1 = (rawInput: string) =>
  F.pipe(
    rawInput,
    parseInput,
    toIndexAfterDistinctItems(4),
    O.getOrElse(() => 0),
  );

const part2 = (rawInput: string) =>
  F.pipe(
    rawInput,
    parseInput,
    toIndexAfterDistinctItems(14),
    O.getOrElse(() => 0),
  );

run({
  part1: {
    tests: [
      {
        input: `mjqjpqmgbljsphdztnvjfqwrcgsmlb`,
        expected: 7,
      },
      {
        input: `bvwbjplbgvbhsrlpgdmjqwftvncz`,
        expected: 5,
      },
      {
        input: `nppdvjthqldpwncqszvftbrmjlhg`,
        expected: 6,
      },
      {
        input: `nznrnfrfntjfmvfwmzdfjlvtqnbhcprsg`,
        expected: 10,
      },
      {
        input: `zcfzfwzzqfrljwzlrfnpqdbhtmscgvjw`,
        expected: 11,
      },
    ],
    solution: part1,
  },
  part2: {
    tests: [
      {
        input: `mjqjpqmgbljsphdztnvjfqwrcgsmlb`,
        expected: 19,
      },
      {
        input: `bvwbjplbgvbhsrlpgdmjqwftvncz`,
        expected: 23,
      },
      {
        input: `nppdvjthqldpwncqszvftbrmjlhg`,
        expected: 23,
      },
      {
        input: `nznrnfrfntjfmvfwmzdfjlvtqnbhcprsg`,
        expected: 29,
      },
      {
        input: `zcfzfwzzqfrljwzlrfnpqdbhtmscgvjw`,
        expected: 26,
      },
    ],
    solution: part2,
  },
  trimTestInputs: true,
  onlyTests: false,
});
