/**
 * A [Change] represents the change from one [State] to another.
 * A [Change] consists of the [currentState] and [nextState].
 */
export class Change<State> {
  private readonly _currentState: State
  private readonly _nextState: State

  constructor(currentState: State, nextState: State) {
    this._currentState = currentState
    this._nextState = nextState
  }

  get currentState(): State {
    return this._currentState
  }

  get nextState(): State {
    return this._nextState
  }

  equal(other: unknown): boolean {
    return other instanceof Change && this.currentState === other.currentState && this.nextState === other._nextState
  }

  toString(): String {
    return `Change { currentState: ${this.currentState}, nextState: ${this._nextState} }`
  }
}
