import { BehaviorSubject, Observable, Subject, EMPTY, Subscription } from 'rxjs'
import { catchError, concatMap } from 'rxjs/operators'
import { fromAsyncIterable } from './utils/observable-from-async-iterator'
import { BlocObserver, EventStreamClosedError, Transition } from '../bloc'

export type NextFunction<Event, State> = (value: Event) => Observable<State>

export abstract class Bloc<Event, State> extends Observable<State> {
  private static _observer: BlocObserver = new BlocObserver()

  private eventSubject = new Subject<Event>()
  private stateSubject: BehaviorSubject<State>

  static get observer(): BlocObserver {
    return this._observer
  }

  static set observer(value: BlocObserver) {
    this._observer = value
  }

  // Returns the current [state] of the [bloc].
  get state(): State {
    return this.stateSubject.value
  }

  listen(
    onData: (value: State) => void,
    onError?: ((onError: any) => any) | undefined,
    onDone?: (() => any) | undefined
  ): Subscription {
    return this.stateSubject.subscribe(onData, onError, onDone)
  }

  constructor(_state: State) {
    super()
    this.stateSubject = new BehaviorSubject(_state)
    this.bindStateSubject()
  }

  abstract mapEventToState(event: Event): AsyncIterableIterator<State>

  add(event: Event) {
    try {
      if (this.eventSubject.isStopped) {
        throw new EventStreamClosedError()
      }
      Bloc.observer.onEvent(this, event)
      this.onEvent(event)
      this.eventSubject.next(event)
    } catch (error) {
      this.handleError(error)
    }
  }

  close() {
    this.stateSubject.complete()
    this.eventSubject.complete()
  }

  transformEvents(events: Observable<Event>, next: NextFunction<Event, State>) {
    return events.pipe(concatMap(next))
  }

  transformStates(states: Observable<State>) {
    return states
  }

  onEvent(_event: Event) {
    return
  }

  onTransition(_transition: Transition<Event, State>) {
    return
  }

  onError(_error: any) {
    return
  }

  private handleError(error: any) {
    Bloc.observer.onError(this, error)
    this.onError(error)
  }

  private bindStateSubject() {
    let currentEvent: Event
    this.transformStates(
      this.transformEvents(this.eventSubject, (event: Event) => {
        currentEvent = event
        return fromAsyncIterable<State>(this.mapEventToState(currentEvent)).pipe(
          catchError(error => {
            this.handleError(error)
            return EMPTY
          })
        )
      })
    ).subscribe((nextState: State) => {
      if (this.state === nextState || this.stateSubject.closed) return
      const transition = new Transition(this.state, currentEvent, nextState)
      Bloc.observer.onTransition(this, transition)
      this.onTransition(transition)
      this.stateSubject.next(nextState)
    })
  }
}
