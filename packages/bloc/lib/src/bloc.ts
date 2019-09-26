import { BehaviorSubject, Observable, Subject, EMPTY } from 'rxjs'
import { catchError, concatMap } from 'rxjs/operators'
import { fromAsyncIterable } from './utils/observable-from-async-iterator'
import { BlocSupervisor } from './bloc-supervisor'
import { EventStreamClosedError } from './errors'
import { Transition } from './transition'

export type NextFunction<Event, State> = (value: Event) => Observable<State>

export abstract class Bloc<Event, State> {
  private eventSubject = new Subject<Event>()
  private stateSubject: BehaviorSubject<State>

  get state(): Observable<State> {
    return this.stateSubject.asObservable()
  }

  get currentState(): State {
    return this.stateSubject.value
  }

  constructor() {
    this.stateSubject = new BehaviorSubject(this.initialState())
    this.bindStateSubject()
  }

  abstract initialState(): State

  abstract mapEventToState(event: Event): AsyncIterableIterator<State>

  dispatch(event: Event) {
    try {
      if (this.eventSubject.isStopped) {
        throw new EventStreamClosedError()
      }
      BlocSupervisor.delegate.onEvent(this, event)
      this.onEvent(event)
      this.eventSubject.next(event)
    } catch (error) {
      this.handleError(error)
    }
  }

  dispose() {
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
    BlocSupervisor.delegate.onError(this, error)
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
      if (this.currentState === nextState || this.stateSubject.closed) return
      const transition = new Transition(this.currentState, currentEvent, nextState)
      BlocSupervisor.delegate.onTransition(this, transition)
      this.onTransition(transition)
      this.stateSubject.next(nextState)
    })
  }
}
