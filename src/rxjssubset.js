import {
  share,
  fromEvent,
  of,
  range,
  interval,
  map,
  combineLatest,
  scan,
  NEVER,
  timer,
  first,
  merge,
  pairwise,
  filter,
  timestamp,
  withLatestFrom,
  take,
  takeUntil,
  mergeMap,
  switchMap,
  BehaviorSubject,
} from "rxjs";

const predicate = () => {
  return (boolO) =>
    boolO.pipe(
      pairwise(),
      filter(([pv, v]) => pv === false && v === true),
      timestamp(),
      map((e) => e.timestamp),
    );
};

const switcher = (startingBehavior, switcherEvent) => {
  return merge(
    startingBehavior.pipe(takeUntil(switcherEvent)),
    switcherEvent.pipe(switchMap((newBehavior) => newBehavior)),
  );
};

const once = (time, value) => {
  return timer(time).pipe(map((_) => value));
};

export {
  share,
  fromEvent,
  of,
  range,
  interval,
  map,
  combineLatest,
  scan,
  NEVER,
  timer,
  once,
  first,
  merge,
  pairwise,
  filter,
  timestamp,
  predicate,
  withLatestFrom,
  take,
  takeUntil,
  mergeMap,
  switchMap,
  switcher,
  BehaviorSubject,
};
