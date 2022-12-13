import run from "aocrunner";

import {
  string as S,
  readonlyArray,
  array as A,
  function as F,
  number as N,
  option as O,
  either as E,
  ord,
  ordering,
  monoid,
} from "fp-ts";

type RecursiveIntArray = (number | RecursiveIntArray)[];

const parseInput = (rawInput: string) =>
  F.pipe(
    rawInput,
    S.trim,
    S.split("\n\n"),
    readonlyArray.toArray,
    A.map(
      F.flow(
        S.split("\n"),
        readonlyArray.toArray,
        A.map((row) => JSON.parse(row)),
      ),
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
): ordering.Ordering =>
  F.pipe(
    first,
    A.zip(second),
    A.map(
      F.flow(
        E.fromPredicate(
          (pair): pair is [number, number] => A.every(N.isNumber)(pair),
          A.map(ensureArray),
        ),
        E.map(([f, s]) => N.Ord.compare(f, s)),
        E.orElse(([f, s]) => E.right(compareIntArray(f, s))),
        O.fromEither,
        O.filter((order) => order !== 0),
      ),
    ),
    A.compact,
    A.lookup(0),
    O.getOrElse(() => N.Ord.compare(first.length, second.length)),
  );

const IntArrayOrd: ord.Ord<RecursiveIntArray> = {
  compare: compareIntArray,
  equals: (first, second) => compareIntArray(first, second) === 0,
};

const part1 = (rawInput: string) => {
  const input = parseInput(rawInput);

  return F.pipe(
    input,
    A.map(([first, second]) => IntArrayOrd.compare(first, second)),
    A.filterMapWithIndex((i, order) =>
      F.pipe(
        order,
        O.fromPredicate((o) => o === -1),
        O.map(() => i + 1),
      ),
    ),
    monoid.concatAll(N.MonoidSum),
  );
};

const part2 = (rawInput: string) => {
  const input = parseInput(rawInput);

  const dividers: RecursiveIntArray[] = [[[2]], [[6]]];

  return F.pipe(
    input,
    A.flatten,
    A.concat(dividers),
    A.sort(IntArrayOrd),
    A.filterMapWithIndex((i, item) =>
      F.pipe(
        O.of(i + 1),
        O.filter(() => dividers.includes(item)),
      ),
    ),
    monoid.concatAll(N.MonoidProduct),
  );
};

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
