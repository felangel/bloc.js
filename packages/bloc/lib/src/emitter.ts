import { Observable, Subscription } from 'rxjs'

export interface BlocEmitter<State> {
  close(): void

  call(state: State): void

  onEach<T>(
    stream$: Observable<T>,
    onData: (data: T) => void,
    onError?: (error: Error) => void
  ): Promise<void>

  forEach<T>(
    stream$: Observable<T>,
    onData: (data: T) => State,
    onError?: (error: Error) => State
  ): Promise<void>
}

export interface Emitter<State> extends BlocEmitter<State> {
  (state: State): void
}

export class _Emitter<State> implements BlocEmitter<State> {
  constructor(private _emit: (newState: State) => void) {}

  private _disposables: Subscription[] = []

  call(state: State) {
    return this._emit(state)
  }

  onEach<T>(
    stream$: Observable<T>,
    onData: (data: T) => void,
    onError?: (error: Error) => void
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      const subscription = stream$.subscribe({
        next: onData,
        error: (error) => {
          if (onError) {
            onError(error)
            resolve()
          } else {
            reject()
          }
        },
        complete: resolve,
      })

      this._disposables.push(subscription)
    })
  }

  forEach<T>(
    stream$: Observable<T>,
    onData: (data: T) => State,
    onError?: ((error: Error) => State) | undefined
  ): Promise<void> {
    return this.onEach(
      stream$,
      (data) => this._emit(onData(data)),
      onError ? (error: unknown) => this._emit(onError(error as Error)) : undefined
    )
  }

  close() {
    this._disposables.forEach((sub) => sub.unsubscribe())
    this._disposables = []
  }
}
