import run from "aocrunner";

import {
  string as S,
  readonlyArray,
  array as A,
  function as F,
  number as N,
  nonEmptyArray as NEA,
} from "fp-ts";

enum OperatorKey {
  "*" = -1,
  "+" = -2,
  "^" = -3,
}

interface MonkeyState {
  stack: number[];
  operation: number[];
  test: number[];
  inspections: number;
}

const parseInput = (rawInput: string) =>
  F.pipe(
    rawInput,
    S.trim,
    S.split("\n\n"),
    readonlyArray.toArray,
    A.map(
      F.flow(
        S.trim,
        S.split("\n"),
        readonlyArray.toArray,
        A.dropLeft(1),
        A.map(
          F.flow(
            S.replace(/old/g, "^"),
            S.replace(/[^\s\d*+\-\^]/g, ""),
            S.trim,
            S.split(" "),
            readonlyArray.toArray,
            A.map((item) => parseInt(OperatorKey[item as any] ?? item)),
          ),
        ),
        ([stack, operation, test, ifFalse, ifTrue]): MonkeyState => ({
          stack,
          operation,
          test: test.concat(ifFalse, ifTrue),
          inspections: 0,
        }),
      ),
    ),
  );

const mapOperation =
  ([a, op, b]: number[]) =>
  (old: number) => {
    const aX = a === OperatorKey["^"] ? old : a;
    const bX = b === OperatorKey["^"] ? old : b;
    switch (op) {
      case OperatorKey["*"]:
        return aX * bX;
      case OperatorKey["+"]:
        return aX + bX;
      default:
        throw new Error(`Operator ${op} not found`);
    }
  };

const mapCoolDown = (old: number) => Math.floor(old / 3);

const simulateRounds = (
  state: MonkeyState[],
  rounds: number,
  reliefFn: (worryLevel: number) => number = (n) => n,
): void => {
  const maxValue = F.pipe(
    state,
    A.map(({ test: [divisible] }) => divisible),
    A.reduce(N.MonoidProduct.empty, N.MonoidProduct.concat),
  );
  F.pipe(
    NEA.range(1, rounds),
    A.map(() =>
      F.pipe(
        state,
        A.map((run) => {
          const {
            stack,
            operation,
            test: [divisible, trueIndex, falseIndex],
          } = run;
          run.stack = [];
          F.pipe(
            stack,
            A.map(
              F.flow(mapOperation(operation), reliefFn, (worryLevel) => {
                run.inspections++;
                if (worryLevel % divisible === 0) {
                  state[trueIndex].stack.push(worryLevel % maxValue);
                } else {
                  state[falseIndex].stack.push(worryLevel % maxValue);
                }
              }),
            ),
          );
        }),
      ),
    ),
  );
};

const getAnswer = (state: MonkeyState[]) =>
  F.pipe(
    state,
    A.map((monkey) => monkey.inspections),
    A.sort(N.Ord),
    A.takeRight(2),
    A.reduce(N.MonoidProduct.empty, N.MonoidProduct.concat),
  );

const part1 = (rawInput: string) => {
  const state = parseInput(rawInput);

  simulateRounds(state, 20, mapCoolDown);

  return getAnswer(state);
};

const part2 = (rawInput: string) => {
  const state = parseInput(rawInput);

  simulateRounds(state, 10000);

  return getAnswer(state);
};

run({
  part1: {
    tests: [
      {
        input: `Monkey 0:
  Starting items: 79, 98
  Operation: new = old * 19
  Test: divisible by 23
    If true: throw to monkey 2
    If false: throw to monkey 3

Monkey 1:
  Starting items: 54, 65, 75, 74
  Operation: new = old + 6
  Test: divisible by 19
    If true: throw to monkey 2
    If false: throw to monkey 0

Monkey 2:
  Starting items: 79, 60, 97
  Operation: new = old * old
  Test: divisible by 13
    If true: throw to monkey 1
    If false: throw to monkey 3

Monkey 3:
  Starting items: 74
  Operation: new = old + 3
  Test: divisible by 17
    If true: throw to monkey 0
    If false: throw to monkey 1`,
        expected: 10605,
      },
    ],
    solution: part1,
  },
  part2: {
    tests: [
      {
        input: `Monkey 0:
  Starting items: 79, 98
  Operation: new = old * 19
  Test: divisible by 23
    If true: throw to monkey 2
    If false: throw to monkey 3

Monkey 1:
  Starting items: 54, 65, 75, 74
  Operation: new = old + 6
  Test: divisible by 19
    If true: throw to monkey 2
    If false: throw to monkey 0

Monkey 2:
  Starting items: 79, 60, 97
  Operation: new = old * old
  Test: divisible by 13
    If true: throw to monkey 1
    If false: throw to monkey 3

Monkey 3:
  Starting items: 74
  Operation: new = old + 3
  Test: divisible by 17
    If true: throw to monkey 0
    If false: throw to monkey 1`,
        expected: 2713310158,
      },
    ],
    solution: part2,
  },
  trimTestInputs: true,
  onlyTests: false,
});
