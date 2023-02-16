export class StateError extends Error {
  constructor(message: string) {
    super(message)

    Object.setPrototypeOf(this, StateError.prototype)
  }
}
