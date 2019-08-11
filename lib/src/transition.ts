export class Transition<Event, State> {
  constructor(public currentState: State, public event: Event, public nextState: State) {}
}
