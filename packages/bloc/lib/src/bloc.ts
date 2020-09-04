import { Observable, Subject, EMPTY, Subscription } from 'rxjs'
import { catchError, concatMap, map } from 'rxjs/operators'
import { BlocObserver, EventStreamClosedError, Transition } from '../bloc'

export type NextFunction<Event, State> = (value: Event) => Observable<Transition<Event, State>>

/**
 *
 * Takes a stream of `Events` as input and transforms them into a Stream of `States` as output.
 *
 * @export
 * @abstract
 * @class Bloc
 * @extends {Observable<State>}
 * @template Event
 * @template State
 */
export abstract class Bloc<Event, State> extends Observable<State> {
  constructor(private _state: State) {
    super()
    this.stateSubject = new Subject()
    this.bindStateSubject()
  }

  private emitted: boolean = false
  private eventSubject = new Subject<Event>()
  private stateSubject: Subject<State>
  private transitionSubscription: Subscription = Subscription.EMPTY

  /**
   * The current `BlocObserver`.
   *
   * @static
   * @type {BlocObserver}
   * @memberof Bloc
   */
  static observer: BlocObserver = new BlocObserver()

  /**
   * Returns the current state of the bloc.
   *
   * @readonly
   * @type {State}
   * @memberof Bloc
   */
  get state(): State {
    return this._state
  }

  /**
   * Adds a Subscription to the bloc's state stream.
   *
   * @param {(value: State) => void} onData
   * @param {(((onError: any) => any) | undefined)} [onError]
   * @param {((() => any) | undefined)} [onDone]
   * @return {*}  {Subscription}
   * @memberof Bloc
   */
  listen(
    onData: (value: State) => void,
    onError?: ((onError: any) => any) | undefined,
    onDone?: (() => any) | undefined
  ): Subscription {
    return this.stateSubject.subscribe(onData, onError, onDone)
  }

  /**
   * Notifies the bloc of a new event which triggers `mapEventToState`.
   *
   * @param {Event} event
   * @memberof Bloc
   */
  add(event: Event): void {
    try {
      if (this.eventSubject.isStopped) {
        throw new EventStreamClosedError()
      }
      this.onEvent(event)
      this.eventSubject.next(event)
    } catch (error) {
      this.onError(error)
    }
  }

  /**
   * Called whenever an event is added to the bloc.
   *
   * @param {Event} event
   * @memberof Bloc
   */
  onEvent(event: Event): void {
    Bloc.observer.onEvent(this, event)
  }

  /**
   * Transforms the events along with a `NextFunction` into
   * an `Observable<Transition>`.
   * Events that should be processed by `mapEventToState` need to be passed to
   * the `next`.
   * By default `concatMap` is used to ensure all events are processed in
   * the order in which they are received.
   * You can override `transformEvents` for advanced usage in order to
   * manipulate the frequency and specificity with which `mapEventToState` is
   * called as well as which `events` are processed.
   *
   * @param {Observable<Event>} events
   * @param {NextFunction<Event, State>} next
   * @return {*}  {Observable<Transition<Event, State>>}
   * @memberof Bloc
   */
  transformEvents(
    events: Observable<Event>,
    next: NextFunction<Event, State>
  ): Observable<Transition<Event, State>> {
    return events.pipe(concatMap(next))
  }

  /**
   * Must be implemented when a class extends `Bloc`.
   * Called whenever an event is added to the bloc and
   * is responsible for converting incoming events into outgoing states.
   *
   * @abstract
   * @param {Event} event
   * @return {*}  {AsyncIterableIterator<State>}
   * @memberof Bloc
   */
  abstract mapEventToState(event: Event): AsyncIterableIterator<State>

  /**
   * Transforms the `Observable<Transition>` into a new `Observable<Transition>`.
   * By default `transformTransitions` returns the incoming `Observable<Transition>`.
   * You can override `transformTransitions` for advanced usage in order to
   * manipulate the frequency and specificity at which `transitions`
   * (state changes) occur.
   *
   * @param {Observable<Transition<Event, State>>} transitions
   * @return {*}  {Observable<Transition<Event, State>>}
   * @memberof Bloc
   */
  transformTransitions(
    transitions: Observable<Transition<Event, State>>
  ): Observable<Transition<Event, State>> {
    return transitions
  }

  /**
   * Called whenever a `transition` occurs with the given `transition`.
   * A `transition` occurs when a new `event` is added and `mapEventToState` executed.
   * `onTransition` is called before a bloc's state has been updated.
   *
   * @param {Transition<Event, State>} transition
   * @memberof Bloc
   */
  onTransition(transition: Transition<Event, State>): void {
    Bloc.observer.onTransition(this, transition)
  }

  /**
   * Called whenever an `error` is thrown within `mapEventToState`.
   * By default all errors will be ignored and bloc functionality will be unaffected.
   *
   * @param {*} error
   * @memberof Bloc
   */
  onError(error: any): void {
    Bloc.observer.onError(this, error)
  }

  /**
   * This method should be called when a `Bloc` is no longer needed.
   * Disposes the resources held by the bloc which means the `Bloc` will
   * no longer process new events after `close` has been called.
   *
   * @memberof Bloc
   */
  close(): void {
    this.stateSubject.complete()
    this.eventSubject.complete()
    this.transitionSubscription.unsubscribe()
  }

  private bindStateSubject(): void {
    this.transitionSubscription = this.transformTransitions(
      this.transformEvents(this.eventSubject, (event: Event) => {
        return asyncToObservable(this.mapEventToState(event)).pipe(
          map((nextState: State, _: number) => {
            return new Transition(this.state, event, nextState)
          }),
          catchError(error => {
            this.onError(error)
            return EMPTY
          })
        )
      })
    ).subscribe((transition: Transition<Event, State>) => {
      if (transition.nextState === this.state && this.emitted) return
      try {
        this.onTransition(transition)
        this._state = transition.nextState
        this.stateSubject.next(transition.nextState)
      } catch (error) {
        this.onError(error)
      }
      this.emitted = true
    })
  }
}

function asyncToObservable<T>(iterable: AsyncIterableIterator<T>): Observable<T> {
  return new Observable<T>(
    observer =>
      void (async () => {
        try {
          for await (const item of iterable) {
            if (observer.closed) return
            observer.next(item)
          }
          observer.complete()
        } catch (e) {
          observer.error(e)
        }
      })()
  )
}
