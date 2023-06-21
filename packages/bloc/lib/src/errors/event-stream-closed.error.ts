export class EventStreamClosedError extends Error {
  constructor() {
    super('cannot add new events after calling close')
    Object.setPrototypeOf(this, EventStreamClosedError.prototype)
  }
}
