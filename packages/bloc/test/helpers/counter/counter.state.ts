type CounterStatus = 'initial' | 'loading' | 'ready' | 'failed'

export class CounterState {
  constructor(public data: number, public status: CounterStatus = 'initial') {}

  ready(data: number) {
    return new CounterState(data, 'ready')
  }

  loading() {
    return new CounterState(this.data, 'loading')
  }

  failed() {
    return new CounterState(this.data, 'failed')
  }
}
