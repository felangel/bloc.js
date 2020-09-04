/**
 * Occurs when an event is added after `mapEventToState` has been called
 * but before the bloc's state has been updated.
 * A `Transition` consists of the `currentState`, the `event` which was
 * added, and the `nextState`.
 *
 * @export
 * @class Transition
 * @template Event
 * @template State
 */
export class Transition<Event, State> {
  constructor(public currentState: State, public event: Event, public nextState: State) {}
}
