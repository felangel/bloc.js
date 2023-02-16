import { Bloc } from '../../../lib/bloc';
import {
  CounterDecrementEvent,
  CounterEvent,
  CounterIncrementEvent,
  CounterNoEmitDataEvent,
} from './counter.event';
import { CounterState } from './counter.state';

export class CounterBloc extends Bloc<CounterEvent, CounterState> {
  constructor() {
    super(new CounterState(0));

    this.on(CounterIncrementEvent, (_event, emit) => {
      emit(this.state.ready(this.state.data + 1));
    });

    this.on(CounterDecrementEvent, (_event, emit) => {
      emit(this.state.ready(this.state.data - 1));
    });

    this.on(CounterNoEmitDataEvent, (_event, emit) => {
      emit(this.state.loading());
    });
  }
}
