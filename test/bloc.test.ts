import { Bloc } from '../lib/bloc'

enum CounterEvent {
  increment = 'INCREMENT',
  decrement = 'DECREMENT'
}

class CounterBloc extends Bloc<CounterEvent, number> {
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
    }
  }
}

/**
 * Bloc
 */
describe('Bloc Test', () => {
  it('CounterBloc is instantiable', () => {
    expect(new CounterBloc()).toBeInstanceOf(CounterBloc)
  })
})
