export class Change<State> {
  constructor(public current: State, public nextState: State) {}
}
