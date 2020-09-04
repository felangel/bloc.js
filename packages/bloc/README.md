<p align="center">
<img src="https://raw.githubusercontent.com/felangel/bloc/master/docs/assets/bloc_logo_full.png" height="100" alt="Bloc" />
</p>

<p align="center">
<a href="https://github.com/felangel/bloc.js/actions"><img src="https://github.com/felangel/bloc.js/workflows/bloc.js/badge.svg" alt="build"></a>
<a href="https://codecov.io/gh/felangel/bloc.js"><img src="https://codecov.io/gh/felangel/bloc.js/branch/master/graph/badge.svg" alt="codecov"></a>
<a href="https://badge.fury.io/js/%40felangel%2Fbloc"><img src="https://badge.fury.io/js/%40felangel%2Fbloc.svg" alt="npm version"></a>
<a href="https://github.com/felangel/bloc.js"><img src="https://img.shields.io/github/stars/felangel/bloc.js.svg?style=flat&logo=github&colorB=deeppink&label=stars" alt="Star on Github"></a>
<a href="https://opensource.org/licenses/MIT"><img src="https://img.shields.io/badge/license-MIT-purple.svg" alt="License: MIT"></a>
<a href="https://discord.gg/Hc5KD3g"><img src="https://img.shields.io/discord/649708778631200778.svg?logo=discord&color=blue" alt="Discord"></a>
<a href="https://github.com/felangel/bloc"><img src="https://tinyurl.com/bloc-library" alt="Bloc Library"></a>
</p>

---

A javascript library that helps implement the [BLoC pattern](https://www.didierboelens.com/2018/08/reactive-programming---streams---bloc).

**Learn more at [bloclibrary.dev](https://bloclibrary.dev)!**

### Bloc

![Bloc Architecture](https://raw.githubusercontent.com/felangel/bloc/master/docs/assets/bloc_architecture_full.png)

A `Bloc` is a component which converts incoming events into outgoing states.

![Bloc Flow](https://raw.githubusercontent.com/felangel/bloc/master/docs/assets/bloc_flow.png)

State changes in bloc begin when events are added which triggers `onEvent`. The events are then funnelled through `transformEvents`. By default, `transformEvents` uses `asyncExpand` to ensure each event is processed in the order it was added but it can be overridden to manipulate the incoming event stream. `mapEventToState` is then invoked with the transformed events and is responsible for yielding states in response to the incoming events. `transitions` are then funnelled through `transformTransitions` which can be overridden to manipulation the outgoing state changes. Lastly, `onTransition` is called just before the state is updated and contains the current state, event, and next state.

#### Creating a Bloc

```ts
// The events which `CounterBloc` will react to.
enum CounterEvent {
  increment = 'INCREMENT'
}

// A `CounterBloc` which handles converting `CounterEvent`s into `int`s.
class CounterBloc extends Bloc<CounterEvent, number> {
  constructor() {
    // The initial state of the `CounterBloc` is 0.
    super(0)
  }

  async *mapEventToState(event: CounterEvent) {
    switch (event) {
      // When a `CounterEvent.increment` event is added,
      // the current `state` of the bloc is accessed via the `state` property
      // and a new state is emitted via `yield`.
      case CounterEvent.increment:
        yield this.state + 1
        break
    }
  }
}
```

#### Using a Bloc

```ts
// Create a `CounterBloc` instance.
const bloc = new CounterBloc()

// Access the state of the `bloc` via `state`.
console.log(bloc.state) // 0

// Interact with the `bloc` to trigger `state` changes.
bloc.add(CounterEvent.increment)

// later...

// Access the new `state`.
print(bloc.state) // 1

// Close the `bloc` when it is no longer needed.
bloc.close()
```

#### Observing a Bloc

```ts
enum CounterEvent {
  increment = 'INCREMENT'
}

class CounterBloc extends Bloc<CounterEvent, number> {
  constructor() {
    super(0)
  }

  async *mapEventToState(event: CounterEvent) {
    switch (event) {
      case CounterEvent.increment:
        yield this.state + 1
        break
    }
  }

  // Called whenever an `event` is added.
  onEvent(event: CounterEvent): void {
    console.log(event)
  }

  // Called whenever a state change is about to occur.
  onTransition(transition: Transition<any, any>): void {
    console.log(transition)
  }

  // Called whenever an `error` is thrown within `mapEventToState`.
  onError(error: any): void {
    console.log(error)
  }
}
```

`BlocObserver` can be used to observe all `blocs` as well.

```ts
class MyBlocObserver extends BlocObserver {
  onEvent(bloc: Bloc<any, any>, event: CounterEvent): void {
    console.log(event)
  }

  onTransition(bloc: Bloc<any, any>, transition: Transition<any, any>): void {
    console.log(transition)
  }

  onError(bloc: Bloc<any, any>, error: any): void {
    console.log(error)
  }
}
```

```ts
Bloc.observer = new MyBlocObserver()
// Use blocs...
```

## Examples

- [Counter](https://github.com/felangel/bloc.js/tree/master/packages/bloc/example) - an example of how to create a `CounterBloc` in a pure typescript app.

### Maintainers

- [Felix Angelov](https://github.com/felangel)
