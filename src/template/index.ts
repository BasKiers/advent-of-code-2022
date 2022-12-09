import run from "aocrunner";

import { string as S, readonlyArray, array as A, function as F } from "fp-ts";

const parseInput = (rawInput: string) =>
  F.pipe(
    rawInput,
    S.trim,
    S.split("\n"),
    readonlyArray.toArray,
    A.map(F.flow(S.trim, S.split(" "))),
  );

const part1 = (rawInput: string) => {
  const input = parseInput(rawInput);

  return;
};

const part2 = (rawInput: string) => {
  const input = parseInput(rawInput);

  return;
};

run({
  part1: {
    tests: [
      // {
      //   input: ``,
      //   expected: "",
      // },
    ],
    solution: part1,
  },
  part2: {
    tests: [
      // {
      //   input: ``,
      //   expected: "",
      // },
    ],
    solution: part2,
  },
  trimTestInputs: true,
  onlyTests: false,
});
