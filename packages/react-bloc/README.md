<img src="https://raw.githubusercontent.com/felangel/bloc.js/master/packages/react-bloc/assets/react_bloc_logo_full.png" height="60" alt="ReactBloc" />

[![react-bloc](https://github.com/felangel/bloc.js/workflows/react-bloc/badge.svg)](https://github.com/felangel/bloc.js/actions?query=workflow%3Areact-bloc)
[![codecov](https://codecov.io/gh/felangel/bloc.js/branch/master/graph/badge.svg)](https://codecov.io/gh/felangel/bloc.js)
[![npm version](https://badge.fury.io/js/%40felangel%2Freact-bloc.svg)](https://badge.fury.io/js/%40felangel%2Freact-bloc)
[![Discord](https://img.shields.io/discord/649708778631200778.svg?logo=discord&color=blue)](https://discord.gg/Hc5KD3g)
[![License: MIT](https://img.shields.io/badge/License-MIT-purple.svg)](https://opensource.org/licenses/MIT)

---

[Bloc](https://github.com/felangel/bloc) for React

This package is built to work with [bloc](https://www.npmjs.com/package/@felangel/bloc).

## Bloc Components

**BlocBuilder** is a React component which requires a `Bloc` and a `builder` function. `BlocBuilder` handles building the component in response to new states. The `builder` function will potentially be called many times and should be a [pure function](https://en.wikipedia.org/wiki/Pure_function) that returns a component in response to the state.

```tsx
<BlocBuilder
  bloc={bloc}
  builder={count => {
    return <p>{count}</p>
  }}
/>
```

If you want fine-grained control over when the builder function is called you can provide an optional `condition` to `BlocBuilder`. The `condition` takes the previous bloc state and current bloc state and returns a boolean. If `condition` returns true, `builder` will be called with `currentState` and the widget will rebuild. If `condition` returns false, `builder` will not be called with `currentState` and no rebuild will occur.

```tsx
<BlocBuilder
  bloc={bloc}
  condition={(previousState, currentState) => {
    return (previousState + currentState) % 3 === 0
  }}
  builder={count => {
    return <p>{count}</p>
  }}
/>
```

### Maintainers

- [Felix Angelov](https://github.com/felangel)
- [Erick Torres](https://github.com/erickjtorres)
