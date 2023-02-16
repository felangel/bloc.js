import { BlocBase } from './base'

export abstract class Cubit<State> extends BlocBase<State> {
  constructor(state: State) {
    super(state)
  }
}
