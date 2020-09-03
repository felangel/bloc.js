<p align="center">
<img src="https://raw.githubusercontent.com/felangel/bloc/master/docs/assets/bloc_logo_full.png" height="100" alt="Bloc" />
</p>

<p align="center">
<a href="https://github.com/felangel/bloc.js/actions"><img src="https://github.com/felangel/bloc.js/workflows/react-bloc/badge.svg" alt="build"></a>
<a href="https://codecov.io/gh/felangel/bloc.js"><img src="https://codecov.io/gh/felangel/bloc.js/branch/master/graph/badge.svg" alt="codecov"></a>
<a href="https://badge.fury.io/js/%40felangel%2Freact-bloc"><img src="https://badge.fury.io/js/%40felangel%2Freact-bloc.svg" alt="npm version"></a>
<a href="https://github.com/felangel/bloc.js"><img src="https://img.shields.io/github/stars/felangel/bloc.js.svg?style=flat&logo=github&colorB=deeppink&label=stars" alt="Star on Github"></a>
<a href="https://opensource.org/licenses/MIT"><img src="https://img.shields.io/badge/license-MIT-purple.svg" alt="License: MIT"></a>
<a href="https://discord.gg/Hc5KD3g"><img src="https://img.shields.io/discord/649708778631200778.svg?logo=discord&color=blue" alt="Discord"></a>
<a href="https://github.com/felangel/bloc"><img src="https://tinyurl.com/bloc-library" alt="Bloc Library"></a>
</p>

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
