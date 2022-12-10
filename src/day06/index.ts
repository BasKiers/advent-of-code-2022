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

const toWindows =
  (windowSize: number) =>
  <T>(arr: T[]): T[][] => {
    const startWindow = A.map(A.of)(arr);
    return F.pipe(
      NEA.range(0, windowSize - 1),
      NEA.foldMap({
        concat: (a, b) => F.pipe(A.zip(a, b), A.map(A.flatten)),
      } as semigroup.Semigroup<T[][]>)((skip) => A.dropLeft(skip)(startWindow)),
    );
  };

const parseInput = (rawInput: string) =>
  F.pipe(rawInput, S.trim, S.split(""), readonlyArray.toArray);

const toIndexAfterDistinctItems =
  (distinctItemCount: number) => (array: string[]) =>
    F.pipe(
      array,
      toWindows(distinctItemCount),
      A.findIndex((window) =>
        F.pipe(
          window,
          set.fromArray(S.Eq),
          (windowSet) => windowSet.size === window.length,
        ),
      ),
      O.map((windowIndex) => windowIndex + distinctItemCount),
    );

const part1 = (rawInput: string) => {
  const input = parseInput(rawInput);

  const answer = F.pipe(
    input,
    toIndexAfterDistinctItems(4),
    O.getOrElse(() => 0),
  );

  return answer;
};

const part2 = (rawInput: string) => {
  const input = parseInput(rawInput);

  const answer = F.pipe(
    input,
    toIndexAfterDistinctItems(14),
    O.getOrElse(() => 0),
  );

  return answer;
};

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
