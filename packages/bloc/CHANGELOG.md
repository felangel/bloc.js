# 0.3.0

Feature parity with dart

- **BREAKING**: rename `BlocDelegate` -> `BlocObserver`
- **BREAKING**: remove `BlocSupervisor`
- **BREAKING**: `transformEvents` returns `Observable<Transition<Event, State>>`
- **BREAKING**: remove `initialState` in favor of `super` constructor
- **BREAKING**: rename `Transition` state to `currentState`
- feat: add `transformTransitions`
- refactor: internal implementation improvements
- docs: add inline documentation and return types

# 0.2.3

Internal improvements and documentation updates

# 0.2.2

Internal improvements and documentation updates

# 0.2.1

Internal improvements and documentation updates

- Dependency updates
- Documentation improvements

# 0.2.0

Feature parity with dart

- Includes `transform` -> `transformEvents`
- Addition of `transformStates`
- Internal improvements to use `fromAsyncIterable`

# 0.1.0

Initial Version of the library.

- Includes the ability to create a custom Bloc by extending `Bloc` class.
- Includes `BlocDelegate` and `BlocSupervisor`
