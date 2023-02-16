type IntervalStatus = "initial" | "loading" | "ready" | "failed"

export class IntervalState {
  constructor(public data: number, public status: IntervalStatus = "initial", public error?: Error) { }

  ready(data: number) {
    return new IntervalState(data, "ready")
  }

  loading() {
    return new IntervalState(this.data, "loading")
  }

  failed(error: Error) {
    return new IntervalState(this.data, "failed", error)
  }
}

export class NoOnErrorState extends IntervalState {}
