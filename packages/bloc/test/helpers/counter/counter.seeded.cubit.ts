import { CounterCubit } from './counter.cubit'

export class SeededCounterCubit extends CounterCubit {
  seed() {
    this.emit(0)
  }
}
