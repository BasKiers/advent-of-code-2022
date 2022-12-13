import run from "aocrunner";

import {
  string as S,
  readonlyArray,
  array as A,
  function as F,
  number as N,
  option as O,
  ord,
  ordering,
  monoid,
} from "fp-ts";

type RecursiveIntArray = (number | RecursiveIntArray)[];

const charCount = (reg: RegExp) => (str: string) =>
  (str.match(reg) || []).length;
const openBracketCount = charCount(/\[/g);
const closedBracketCount = charCount(/\]/g);

const parseArrayString = (str: string): RecursiveIntArray =>
  F.pipe(
    str,
    (str) => str.replace(/(^\[|\]$)/g, ""),
    S.split(","),
    readonlyArray.reduce(
      { depth: 0, buffer: [], result: [] } as {
        depth: number;
        buffer: string[];
        result: RecursiveIntArray;
      },
      (state, part) => {
        if (!part) {
          return state;
        }

        const openCount = openBracketCount(part);
        if (state.depth + openCount === 0) {
          return { ...state, result: [...state.result, parseInt(part)] };
        }
        const buffer = state.buffer.concat(part);

        const closedCount = closedBracketCount(part);
        const depth = state.depth + openCount - closedCount;
        if (depth === 0) {
          return {
            ...state,
            depth,
            buffer: [],
            result: [...state.result, parseArrayString(buffer.join(","))],
          };
        }

        return { ...state, depth, buffer };
      },
    ),
    ({ result }) => result,
  );

const parseInput = (rawInput: string) =>
  F.pipe(
    rawInput,
    S.trim,
    S.split("\n\n"),
    readonlyArray.toArray,
    A.map(
      F.flow(S.split("\n"), readonlyArray.toArray, A.map(parseArrayString)),
    ),
  );

const ensureArray = <T>(elem: T): T[] =>
  F.pipe(
    elem,
    O.fromPredicate(Array.isArray),
    O.getOrElse(() => [elem]),
  );

const compareIntArray = (
  first: RecursiveIntArray,
  second: RecursiveIntArray,
): ordering.Ordering => {
  for (let i = 0; i < first.length && i < second.length; i++) {
    const ordering = F.pipe(
      [first[i], second[i]],
      O.fromPredicate((pair): pair is [number, number] =>
        pair.every(N.isNumber),
      ),
      O.map(([f, s]) => N.Ord.compare(f, s)),
      O.getOrElse(() =>
        compareIntArray(ensureArray(first[i]), ensureArray(second[i])),
      ),
    );
    if (ordering !== 0) {
      return ordering;
    }
  }
  return N.Ord.compare(first.length, second.length);
};

const IntArrayOrd: ord.Ord<RecursiveIntArray> = {
  compare: compareIntArray,
  equals: (first, second) => compareIntArray(first, second) === 0,
};

const part1 = (rawInput: string) => {
  const input = parseInput(rawInput);

  const answer = F.pipe(
    input,
    A.map(([first, second]) => IntArrayOrd.compare(first, second)),
    A.mapWithIndex((i, ordering) => (ordering === -1 ? i + 1 : 0)),
    monoid.concatAll(N.MonoidSum),
  );

  return answer;
};

const part2 = (rawInput: string) => {
  const input = parseInput(rawInput);

  const dividerA: RecursiveIntArray = [[2]];
  const dividerB: RecursiveIntArray = [[6]];

  const sortedInput = F.pipe(
    input,
    A.flatten,
    A.concat([dividerA, dividerB]),
    A.sort(IntArrayOrd),
  );

  const indexA = F.pipe(
    sortedInput,
    A.findIndex((item) => IntArrayOrd.equals(item, dividerA)),
  );
  const indexB = F.pipe(
    sortedInput,
    A.findIndex((item) => IntArrayOrd.equals(item, dividerB)),
  );

  return F.pipe(
    [indexA, indexB],
    A.compact,
    A.map((index) => index + 1),
    monoid.concatAll(N.MonoidProduct),
  );
};

/**
 * [[]] | [[[]]]
 * [] | [[]]
 */

run({
  part1: {
    tests: [
      {
        input: `[1,1,3,1,1]
      [1,1,5,1,1]

      [[1],[2,3,4]]
      [[1],4]

      [9]
      [[8,7,6]]

      [[4,4],4,4]
      [[4,4],4,4,4]

      [7,7,7,7]
      [7,7,7]

      []
      [3]

      [[[]]]
      [[]]

      [1,[2,[3,[4,[5,6,7]]]],8,9]
      [1,[2,[3,[4,[5,6,0]]]],8,9]`,
        expected: 13,
      },
    ],
    solution: part1,
  },
  part2: {
    tests: [
      {
        input: `[1,1,3,1,1]
[1,1,5,1,1]

[[1],[2,3,4]]
[[1],4]

[9]
[[8,7,6]]

[[4,4],4,4]
[[4,4],4,4,4]

[7,7,7,7]
[7,7,7]

[]
[3]

[[[]]]
[[]]

[1,[2,[3,[4,[5,6,7]]]],8,9]
[1,[2,[3,[4,[5,6,0]]]],8,9]`,
        expected: 140,
      },
    ],
    solution: part2,
  },
  trimTestInputs: true,
  onlyTests: false,
});
