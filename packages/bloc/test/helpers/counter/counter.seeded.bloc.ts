import { CounterBloc } from './counter.bloc'
import { CounterEvent } from './counter.event'

export class SeedEvent extends CounterEvent {}

export class SeededCounterBloc extends CounterBloc {
  constructor() {
    super()

    this.on(SeedEvent, (event, emit) => {
      emit(this.state)
    })
  }
}
