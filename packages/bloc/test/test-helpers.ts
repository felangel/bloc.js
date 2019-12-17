import { Bloc, BlocDelegate, NextFunction } from '../lib/bloc'
import { Observable } from 'rxjs'
import { distinct, switchMap } from 'rxjs/operators'

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
        yield this.state + 1
        break
      case CounterEvent.decrement:
        yield this.state - 1
        break
      case CounterEvent.doNothing:
        yield this.state
        break
      case CounterEvent.badEvent:
        throw new CounterBlocError()
    }
  }
}

export class DistinctCounterBloc extends CounterBloc {
  transformEvents(events: Observable<CounterEvent>, next: NextFunction<CounterEvent, number>) {
    return super.transformEvents(events.pipe(distinct()), next)
  }
}

export class SwitchMapCounterBloc extends CounterBloc {
  transformEvents(events: Observable<CounterEvent>, next: NextFunction<CounterEvent, number>) {
    return events.pipe(switchMap(next))
  }
}

export class MyBlocDelegate extends BlocDelegate {}
