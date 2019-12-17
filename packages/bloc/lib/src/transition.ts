export class Transition<Event, State> {
  constructor(public state: State, public event: Event, public nextState: State) {}
}
