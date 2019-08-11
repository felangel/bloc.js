import { Bloc, BlocDelegate } from '../lib/bloc'

export class CounterBlocError extends Error {}

export enum CounterEvent {
  increment = 'INCREMENT',
  decrement = 'DECREMENT',
  doNothing = 'DO_NOTHING',
  badEvent = 'BAD_EVENT'
}

export class CounterBloc extends Bloc<CounterEvent, number> {
  initialState(): number {
    return 0
  }

  async *mapEventToState(event: CounterEvent) {
    switch (event) {
      case CounterEvent.increment:
        yield this.currentState + 1
        break
      case CounterEvent.decrement:
        yield this.currentState - 1
        break
      case CounterEvent.doNothing:
        yield this.currentState
        break
      case CounterEvent.badEvent:
        throw new CounterBlocError()
    }
  }
}

export class MyBlocDelegate extends BlocDelegate {}
