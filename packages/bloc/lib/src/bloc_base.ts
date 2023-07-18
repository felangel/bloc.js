import { Observable, Subject, Subscription } from 'rxjs'
import { Change } from './change'
import { BlocObserver } from './bloc-observer'
import { EmitStateSubjectClosedError } from './errors'


export abstract class BlocBase<State> extends Observable<State> {
  protected constructor(state: State) {
    super()
    this._state = state
    this.stateSubject = new Subject()
  }

  protected emitted: boolean = false
  protected stateSubject: Subject<State>

  /**
   * The current `BlocObserver`.
   *
   * @static
   * @type {BlocObserver}
   * @memberof BlocBase
   */
  static observer: BlocObserver = new BlocObserver()

  private _state: State

  /**
   * Returns the current state of the bloc.
   *
   * @readonly
   * @type {State}
   * @memberof BlocBase
   */
  get state(): State {
    return this._state
  }

  /**
   * Returns if the block is closed.
   *
   * @readonly
   * @type {boolean}
   * @memberof BlocBase
   */
  get isClosed(): boolean {
    return this.stateSubject.isStopped
  }

  /**
   * Adds a Subscription to the bloc's state stream.
   *
   * @param {(value: State) => void} onData
   * @param {(((onError: any) => any) | undefined)} [onError]
   * @param {((() => any) | undefined)} [onDone]
   * @return {*}  {Subscription}
   * @memberof BlocBase
   */
  public listen(
    onData: (value: State) => void,
    onError?: ((onError: any) => any) | undefined,
    onDone?: (() => any) | undefined
  ): Subscription {
    return this.stateSubject.subscribe(onData, onError, onDone)
  }

  protected emit(state: State): void {
    try {
      if (this.isClosed) throw new EmitStateSubjectClosedError()

      if (state === this.state && this.emitted) return

      this.onChange(new Change<State>(this._state, state))
      this._state = state
      this.stateSubject.next(state)
      this.emitted = true
    } catch (e) {
      this.onError(e)
    }
  }


  /**
   * Called whenever a [change] occurs with the given [change].
   * A [change] occurs when a new `state` is emitted.
   * [onChange] is called before the `state` is updated.
   * [onChange] is a great spot to add logging/analytics for a specific `cubit`.
   *
   * @param {*} error
   * @memberof BlocBase
   */
  protected onChange(change: Change<State>): void {
    BlocBase.observer.onChange(this, change)
  }

  /**
   * Call this method to add a new error
   * By default all errors will be ignored and bloc functionality will be unaffected.
   *
   * @param error
   * @protected
   */
  protected addError(error: unknown): void {
    this.onError(error)
  }


  /**
   * Called whenever an `error` is thrown within `mapEventToState`.
   * By default all errors will be ignored and bloc functionality will be unaffected.
   *
   * @param {*} error
   * @memberof BlocBase
   */
  protected onError(error: unknown): void {
    BlocBase.observer.onError(this, error)
  }

  /**
   * This method should be called when a `BlocBase` is no longer needed.
   * Disposes the resources held by the bloc which means the `Bloc` will
   * no longer process new events after `close` has been called.
   *
   * @memberof BlocBase
   */
  public close(): void {
    this.stateSubject.complete()
  }
}

