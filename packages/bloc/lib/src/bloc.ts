import { Observable, Subject, EMPTY, Subscription } from 'rxjs'
import { catchError, concatMap, map } from 'rxjs/operators'
import { BlocBase } from './bloc_base'
import { Transition } from './transition'
import { EventStreamClosedError } from './errors'

export type NextFunction<Event, State> = (value: Event) => Observable<Transition<Event, State>>

/**
 *
 * Takes a stream of `Events` as input and transforms them into a Stream of `States` as output.
 *
 * @export
 * @abstract
 * @class Bloc
 * @extends {BlocBase<State>}
 * @template Event
 * @template State
 */
export abstract class Bloc<Event, State> extends BlocBase<State> {
  /* istanbul ignore next */
  protected constructor(state: State) {
    super(state)
    this.bindStateSubject()
  }

  private eventSubject = new Subject<Event>()
  private transitionSubscription: Subscription = Subscription.EMPTY

  /**
   * Notifies the bloc of a new event which triggers `mapEventToState`.
   *
   * @param {Event} event
   * @memberof Bloc
   */
  public add(event: Event): void {
    try {
      if (this.eventSubject.isStopped) {
        throw new EventStreamClosedError()
      }
      this.onEvent(event)
      this.eventSubject.next(event)
    } catch (error) {
      this.addError(error)
    }
  }

  /**
   * Called whenever an event is added to the bloc.
   *
   * @param {Event} event
   * @memberof Bloc
   */
  protected onEvent(event: Event): void {
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
  protected transformEvents(
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
  protected abstract mapEventToState(event: Event): AsyncIterableIterator<State>

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
  protected transformTransitions(
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
  protected onTransition(transition: Transition<Event, State>): void {
    Bloc.observer.onTransition(this, transition)
  }

  /**
   * This method should be called when a `Bloc` is no longer needed.
   * Disposes the resources held by the bloc which means the `Bloc` will
   * no longer process new events after `close` has been called.
   *
   * @memberof Bloc
   */
  public close(): void {
    super.close()
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
            this.addError(error)
            return EMPTY
          })
        )
      })
    ).subscribe((transition: Transition<Event, State>) => {
      if (transition.nextState === this.state && this.emitted) return

      try {
        this.onTransition(transition)
        this.emit(transition.nextState)
      } catch (error) {
        this.addError(error)
      }
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
