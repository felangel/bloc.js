import { BlocBase } from "./bloc-base";

export class Cubit<State> extends BlocBase<State> {
  constructor(initialState: State) {
    super(initialState);
  }
}