import run from "aocrunner";

import {
  string as S,
  readonlyArray,
  nonEmptyArray as NEA,
  array as A,
  function as F,
  option as O,
  number as N,
  map,
  boolean as B,
  monoid,
  set,
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
        (str) => str.match(/([A-Z]{2}|\d+)/g),
        O.fromNullable,
        O.map(
          ([source, flow, ...destinations]): [string, [number, string[]]] => [
            source,
            [parseInt(flow), destinations],
          ],
        ),
      ),
    ),
    A.compact,
    (entries) => new Map(entries),
  );

type PipeMapping = Map<string, [number, string[]]>;

type State = {
  open: Map<string, number>;
  locations: string[];
  releasedPressure: number;
  cycles: Set<string>[];
};

const toOpenValveAction =
  (mapping: PipeMapping, locationIndex: number) => (state: State) => {
    const location = state.locations[locationIndex];
    return F.pipe(
      state.open,
      O.fromPredicate(F.flow(map.member(S.Eq)(location), B.BooleanAlgebra.not)),
      O.filter(() => Boolean(mapping.get(location)?.[0])),
      O.map(map.upsertAt(S.Eq)(location, mapping.get(location)![0])),
      O.map((newOpen) => [
        {
          ...state,
          open: newOpen,
          cycles: F.pipe(
            state.cycles,
            A.modifyAt(locationIndex, () => new Set<string>()),
            O.getOrElse(() => state.cycles),
          ),
        },
      ]),
    );
  };

const toMoveActions =
  (mapping: PipeMapping, locationIndex: number) => (state: State) => {
    const cycle = state.cycles[locationIndex];
    const location = state.locations[locationIndex];
    return F.pipe(
      mapping.get(location)![1],
      A.filter((l) => !cycle.has(l)),
      A.map((newLocation) => ({
        ...state,
        locations: F.pipe(
          state.locations,
          A.modifyAt(locationIndex, () => newLocation),
          O.getOrElse(() => state.locations),
        ),
        cycles: F.pipe(
          state.cycles,
          A.modifyAt(locationIndex, set.insert(S.Eq)(location)),
          O.getOrElse(() => state.cycles),
        ),
      })),
    );
  };

const getMostPressureReleased =
  (iterations: number, startLocations: string[]) => (mapping: PipeMapping) => {
    const minScore: number[] = new Array(iterations + 1).fill(0);
    const maxOpenCount = F.pipe(
      mapping,
      map.toArray(S.Ord),
      A.filter(([, [flow]]) => flow > 0),
      A.size,
    );

    return F.pipe(
      NEA.range(1, iterations),
      A.reduce(
        [
          {
            open: new Map(),
            locations: startLocations,
            releasedPressure: 0,
            cycles: A.map(() => new Set<string>())(startLocations),
          },
        ] as State[],
        (states, i) => {
          return F.pipe(
            states,
            A.map((state) => {
              const releasedPressure = F.pipe(
                state.open,
                map.values(N.Ord),
                monoid.concatAll(N.MonoidSum),
                (releasedPressureInCycle) =>
                  state.releasedPressure + releasedPressureInCycle,
              );
              if (map.size(state.open) === maxOpenCount) {
                // Short circuit, when all valves are open no need to keep moving
                return [
                  {
                    ...state,
                    releasedPressure,
                  },
                ];
              }

              // Quick "optimization" to drop non-viable runs
              const isNonViable = F.pipe(
                minScore,
                O.fromPredicate(() => i > 5),
                O.chain(A.findIndex((score) => score > releasedPressure)),
                O.filter((minScoreIndex) => i > minScoreIndex),
                O.isSome,
              );
              if (isNonViable) {
                return [];
              }
              minScore[i] = Math.max(minScore[i], releasedPressure);
              // end of quick "optimization"

              return F.pipe(
                NEA.range(0, state.locations.length - 1),
                A.reduce([state] as State[], (states, locationIndex) =>
                  F.pipe(
                    states,
                    A.map(({ open, locations, cycles }): State[] => {
                      const newState = {
                        open,
                        locations,
                        cycles,
                        releasedPressure,
                      };
                      return F.pipe(
                        newState,
                        toOpenValveAction(mapping, locationIndex),
                        O.getOrElse((): State[] => []),
                        A.concat(
                          F.pipe(
                            newState,
                            toMoveActions(mapping, locationIndex),
                          ),
                        ),
                        O.fromPredicate((moves) => moves.length !== 0),
                        O.getOrElse(() => [newState]),
                      );
                    }),
                    A.flatten,
                  ),
                ),
              );
            }),
            A.flatten,
          );
        },
      ),
      A.map(({ releasedPressure }) => releasedPressure),
      A.sort(N.Ord),
      A.last,
      O.getOrElse(() => 0),
    );
  };

const part1 = (rawInput: string) =>
  F.pipe(rawInput, parseInput, getMostPressureReleased(30, ["AA"]));

const part2 = (rawInput: string) =>
  F.pipe(rawInput, parseInput, getMostPressureReleased(26, ["AA", "AA"]));

run({
  part1: {
    tests: [
      {
        input: `Valve AA has flow rate=0; tunnels lead to valves DD, II, BB
Valve BB has flow rate=13; tunnels lead to valves CC, AA
Valve CC has flow rate=2; tunnels lead to valves DD, BB
Valve DD has flow rate=20; tunnels lead to valves CC, AA, EE
Valve EE has flow rate=3; tunnels lead to valves FF, DD
Valve FF has flow rate=0; tunnels lead to valves EE, GG
Valve GG has flow rate=0; tunnels lead to valves FF, HH
Valve HH has flow rate=22; tunnel leads to valve GG
Valve II has flow rate=0; tunnels lead to valves AA, JJ
Valve JJ has flow rate=21; tunnel leads to valve II`,
        expected: 1651,
      },
    ],
    solution: part1,
  },
  part2: {
    tests: [
      {
        input: `Valve AA has flow rate=0; tunnels lead to valves DD, II, BB
      Valve BB has flow rate=13; tunnels lead to valves CC, AA
      Valve CC has flow rate=2; tunnels lead to valves DD, BB
      Valve DD has flow rate=20; tunnels lead to valves CC, AA, EE
      Valve EE has flow rate=3; tunnels lead to valves FF, DD
      Valve FF has flow rate=0; tunnels lead to valves EE, GG
      Valve GG has flow rate=0; tunnels lead to valves FF, HH
      Valve HH has flow rate=22; tunnel leads to valve GG
      Valve II has flow rate=0; tunnels lead to valves AA, JJ
      Valve JJ has flow rate=21; tunnel leads to valve II`,
        expected: 1707,
      },
    ],
    solution: part2,
  },
  trimTestInputs: true,
  onlyTests: false,
});
