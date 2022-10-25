export class EmitStateSubjectClosedError extends Error {
  constructor() {
    super('cannot emit new states after calling close')
  }
}
