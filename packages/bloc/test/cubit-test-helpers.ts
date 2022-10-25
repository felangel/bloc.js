import { Cubit } from '../lib/src/cubit'
import { Change } from '../lib/src/change'

export class CounterCubit extends Cubit<number> {

  constructor() {
    super(0)
  }

  public increment(): void {
    this.emit(this.state + 1)
  }

  public decremet(): void {
    this.emit(this.state - 1)
  }

  public doNothing(): void {
    this.emit(this.state)
  }
}
