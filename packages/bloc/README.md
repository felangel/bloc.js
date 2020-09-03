<img src="https://raw.githubusercontent.com/felangel/bloc/master/docs/assets/bloc_logo_full.png" height="60" alt="Bloc" />

[![bloc.js](https://github.com/felangel/bloc.js/workflows/bloc.js/badge.svg)](https://github.com/felangel/bloc.js/actions?query=workflow%3Abloc.js)
[![codecov](https://codecov.io/gh/felangel/bloc.js/branch/master/graph/badge.svg)](https://codecov.io/gh/felangel/bloc.js)
[![npm version](https://badge.fury.io/js/%40felangel%2Fbloc.svg)](https://badge.fury.io/js/%40felangel%2Fbloc)
[![Discord](https://img.shields.io/discord/649708778631200778.svg?logo=discord&color=blue)](https://discord.gg/Hc5KD3g)
[![License: MIT](https://img.shields.io/badge/License-MIT-purple.svg)](https://opensource.org/licenses/MIT)

---

[Bloc](https://github.com/felangel/bloc) for JavaScript/TypeScript

## Overview

<img src="https://raw.githubusercontent.com/felangel/bloc/master/docs/assets/bloc_architecture.png" width="500" alt="Bloc Architecture" />

The goal of this package is to make it easy to implement the `BLoC` Design Pattern (Business Logic Component).

This design pattern helps to separate _presentation_ from _business logic_. Following the BLoC pattern facilitates testability and reusability. This package abstracts reactive aspects of the pattern allowing developers to focus on converting events into states.

## Glossary

**Events** are the input to a Bloc. They are commonly UI events such as button presses. `Events` are `dispatched` and then converted to `States`.

**States** are the output of a Bloc. Presentation components can listen to the stream of states and redraw portions of themselves based on the given state (see `BlocBuilder` for more details).

**Transitions** occur when an `Event` is `dispatched` after `mapEventToState` has been called but before the `Bloc`'s state has been updated. A `Transition` consists of the currentState, the event which was dispatched, and the nextState.

**BlocSupervisor** oversees `Bloc`s and delegates to `BlocDelegate`.

**BlocDelegate** handles events from all `Bloc`s which are delegated by the `BlocSupervisor`. Can be used to intercept all `Bloc` events, transitions, and errors. **It is a great way to handle logging/analytics as well as error handling universally**.

## Bloc Interface

**initialState** is the state before any events have been processed (before `mapEventToState` has ever been called). `initialState` **must be implemented**.

**mapEventToState** is a method that **must be implemented** when a class extends `Bloc`. The function takes the incoming event as an argument. `mapEventToState` is called whenever an event is `dispatched` by the presentation layer. `mapEventToState` must convert that event into a new state and return the new state in the form of a `Stream` which is consumed by the presentation layer.

**dispatch** is a method that takes an `event` and triggers `mapEventToState`. `dispatch` may be called from the presentation layer or from within the Bloc (see examples) and notifies the Bloc of a new `event`.

**transformEvents** is a method that transforms the `Stream<Event>` along with a `next` function into a `Stream<State>`. Events that should be processed by `mapEventToState` need to be passed to `next`. **By default `asyncExpand` is used to ensure all events are processed in the order in which they are received**. You can override `transformEvents` for advanced usage in order to manipulate the frequency and specificity with which `mapEventToState` is called as well as which events are processed.

**transformStates** is a method that transforms the `Stream<State>` into a new `Stream<State>`. By default `transformStates` returns the incoming `Stream<State>`. You can override `transformStates` for advanced usage in order to manipulate the frequency and specificity at which `transitions` (state changes) occur.

**onEvent** is a method that can be overridden to handle whenever an `Event` is dispatched. **It is a great place to add bloc-specific logging/analytics**.

**onTransition** is a method that can be overridden to handle whenever a `Transition` occurs. A `Transition` occurs when a new `Event` is dispatched and `mapEventToState` is called. `onTransition` is called before a `Bloc`'s state has been updated. **It is a great place to add bloc-specific logging/analytics**.

**onError** is a method that can be overridden to handle whenever an `Exception` is thrown. By default all exceptions will be ignored and `Bloc` functionality will be unaffected. **It is a great place to add bloc-specific error handling**.

**dispose** is a method that closes the `event` and `state` streams. `Dispose` should be called when a `Bloc` is no longer needed. Once `dispose` is called, `events` that are `dispatched` will not be processed and will result in an error being passed to `onError`. In addition, if `dispose` is called while `events` are still being processed, any `states` yielded after are ignored and will not result in a `Transition`.

## BlocDelegate Interface

**onEvent** is a method that can be overridden to handle whenever an `Event` is dispatched to **any** `Bloc`. **It is a great place to add universal logging/analytics**.

**onTransition** is a method that can be overridden to handle whenever a `Transition` occurs in **any** `Bloc`. **It is a great place to add universal logging/analytics**.

**onError** is a method that can be overriden to handle whenever an `Exception` is thrown from **any** `Bloc`. **It is a great place to add universal error handling**.

## Usage

For simplicity we can create a `CounterBloc` like:

```typescript
class CounterBloc extends Bloc<CounterEvent, number> {
  initialState(): number {
    return 0
  }

  async *mapEventToState(event: CounterEvent) {
    switch (event) {
      case CounterEvent.increment:
        yield this.state + 1
        break
      case CounterEvent.decrement:
        yield this.state - 1
        break
    }
  }
}
```

Our `CounterBloc` converts `CounterEvents` to integers.

As a result, we need to define our `CounterEvent` like:

```typescript
enum CounterEvent {
  increment = 'INCREMENT',
  decrement = 'DECREMENT'
}
```

Then we can dispatch events to our bloc like so:

```typescript
const counterBloc = new CounterBloc()

counterBloc.add(CounterEvent.increment)
counterBloc.add(CounterEvent.increment)
counterBloc.add(CounterEvent.increment)

counterBloc.add(CounterEvent.decrement)
counterBloc.add(CounterEvent.decrement)
counterBloc.add(CounterEvent.decrement)
```

As our app grows and relies on multiple `Blocs`, it becomes useful to see the `Transitions` for all `Blocs`. This can easily be achieved by implementing a `BlocDelegate`.

```typescript
class SimpleBlocDelegate extends BlocDelegate {
  onTransition(_: Bloc<any, any>, transition: Transition<any, any>) {
    console.log(transition)
  }
}
```

Now that we have our `SimpleBlocDelegate`, we just need to tell the `BlocSupervisor` to use our delegate.

```typescript
BlocSupervisor.delegate = new SimpleBlocDelegate()
const counterBloc = new CounterBloc()

counterBloc.add(CounterEvent.increment) // { currentState: 0, event: CounterEvent.increment, nextState: 1 }
counterBloc.add(CounterEvent.increment) // { currentState: 1, event: CounterEvent.increment, nextState: 2 }
counterBloc.add(CounterEvent.increment) // { currentState: 2, event: CounterEvent.increment, nextState: 3 }

counterBloc.add(CounterEvent.decrement) // { currentState: 3, event: CounterEvent.decrement, nextState: 2 }
counterBloc.add(CounterEvent.decrement) // { currentState: 2, event: CounterEvent.decrement, nextState: 1 }
counterBloc.add(CounterEvent.decrement) // { currentState: 1, event: CounterEvent.decrement, nextState: 0 }
```

At this point, all `Bloc` `Transitions` will be reported to the `SimpleBlocDelegate` and we can see them in the console after running our app.

If we want to be able to handle any incoming `Events` that are dispatched to a `Bloc` we can also override `onEvent` in our `SimpleBlocDelegate`.

```typescript
class SimpleBlocDelegate extends BlocDelegate {
  onEvent(_: Bloc<any, any>, event: CounterEvent) {
    console.log(`dispatched ${event}`)
  }

  onTransition(_: Bloc<any, any>, transition: Transition<any, any>) {
    console.log(transition)
  }
}
```

If we want to be able to handle any `Exceptions` that might be thrown in a `Bloc` we can also override `onError` in our `SimpleBlocDelegate`.

```typescript
class SimpleBlocDelegate extends BlocDelegate {
  onEvent(_: Bloc<any, any>, event: CounterEvent) {
    console.log(`dispatched ${event}`)
  }

  onTransition(_: Bloc<any, any>, transition: Transition<any, any>) {
    console.log(transition)
  }

  onError(_: Bloc<any, any>, error: any) {
    console.log(`error: ${error}`)
  }
}
```

At this point, all `Bloc` `Exceptions` will also be reported to the `SimpleBlocDelegate` and we can see them in the console.

## Examples

- [Counter](https://github.com/felangel/bloc.js/tree/master/packages/bloc/example) - an example of how to create a `CounterBloc` in a pure typescript app.

### Maintainers

- [Felix Angelov](https://github.com/felangel)
