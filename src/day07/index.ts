import run from "aocrunner";

import {
  string as S,
  readonlyArray as ROA,
  nonEmptyArray as NEA,
  array as A,
  number as N,
  function as F,
  option as O,
  map,
  monoid,
} from "fp-ts";

const parseInput = (rawInput: string) =>
  F.pipe(
    rawInput,
    S.trim,
    S.split("$"),
    ROA.toArray,
    A.dropLeft(1),
    A.map(
      F.flow(
        S.trim,
        S.split("\n"),
        ROA.toArray,
        A.map(F.flow(S.split(" "), ROA.toArray)),
      ),
    ),
  );

const mapWithTail =
  <A, B>(fn: (item: A, tail: A[]) => B): ((entries: A[]) => B[]) =>
  (entries) =>
    F.pipe(
      NEA.range(0, entries.length - 1),
      NEA.map((index) => fn(entries[index], entries.slice(index + 1))),
    );

const toDirSizeMap = (commands: string[][][]): Map<string, number> =>
  F.pipe(
    commands,
    A.dropLeft(1),
    A.reduce(
      { cwd: "", dirs: new Map<string, number>() },
      ({ cwd, dirs }, [[name, param], ...output]) => {
        switch (name) {
          case "cd":
            return {
              cwd: F.pipe(
                cwd,
                S.split("/"),
                param === ".." ? ROA.dropRight(1) : ROA.concat([param]),
                (cwdParts) => cwdParts.join("/"),
              ),
              dirs,
            };
          case "ls":
            return {
              cwd,
              dirs: F.pipe(
                dirs,
                map.upsertAt(S.Eq)(
                  cwd,
                  F.pipe(
                    output,
                    A.map(
                      F.flow(
                        A.lookup(0),
                        O.map(parseInt),
                        O.filter((size) => !Number.isNaN(size)),
                      ),
                    ),
                    A.compact,
                    monoid.concatAll(N.MonoidSum),
                  ),
                ),
              ),
            };
        }
        return { cwd, dirs };
      },
    ),
    ({ dirs }) => dirs,
    map.toArray(S.Ord),
    mapWithTail(([name, size], tail): [string, number] => [
      name || "/",
      F.pipe(
        tail,
        A.takeLeftWhile(([n]) => n.startsWith(name)),
        A.map(([, s]) => s),
        A.concat([size]),
        monoid.concatAll(N.MonoidSum),
      ),
    ]),
    (entries) => new Map(entries),
  );

const part1 = (rawInput: string) =>
  F.pipe(
    rawInput,
    parseInput,
    toDirSizeMap,
    map.values(N.Ord),
    A.takeLeftWhile((size) => size < 100000),
    monoid.concatAll(N.MonoidSum),
  );

const part2 = (rawInput: string) => {
  const input = parseInput(rawInput);

  const dirMap = toDirSizeMap(input);

  const totalSize = 70000000;
  const needed = 30000000;
  const minimalRemoval = needed - (totalSize - dirMap.get("/")!);

  return F.pipe(
    dirMap,
    map.values(N.Ord),
    A.dropLeftWhile((size) => size < minimalRemoval),
    A.lookup(0),
    O.getOrElse(() => 0),
  );
};

run({
  part1: {
    tests: [
      {
        input: `$ cd /
$ ls
dir a
14848514 b.txt
8504156 c.dat
dir d
$ cd a
$ ls
dir e
29116 f
2557 g
62596 h.lst
$ cd e
$ ls
584 i
$ cd ..
$ cd ..
$ cd d
$ ls
4060174 j
8033020 d.log
5626152 d.ext
7214296 k`,
        expected: 95437,
      },
    ],
    solution: part1,
  },
  part2: {
    tests: [
      {
        input: `$ cd /
$ ls
dir a
14848514 b.txt
8504156 c.dat
dir d
$ cd a
$ ls
dir e
29116 f
2557 g
62596 h.lst
$ cd e
$ ls
584 i
$ cd ..
$ cd ..
$ cd d
$ ls
4060174 j
8033020 d.log
5626152 d.ext
7214296 k`,
        expected: 24933642,
      },
    ],
    solution: part2,
  },
  trimTestInputs: true,
  onlyTests: false,
});
