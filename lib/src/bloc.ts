import { BehaviorSubject, Subject, Observable } from 'rxjs'
import { concatMap } from 'rxjs/operators'
import { BlocSupervisor } from './bloc-supervisor'
import { Transition } from './transition'

class EventStreamClosedError extends Error {}

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
        throw new EventStreamClosedError('cannot add new events after calling close')
      }
      BlocSupervisor.delegate.onEvent(this, event)
      this.onEvent(event)
      this.eventSubject.next(event)
    } catch (error) {
      BlocSupervisor.delegate.onError(this, error)
      this.onError(error)
    }
  }

  dispose() {
    this.stateSubject.complete()
    this.eventSubject.complete()
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

  private bindStateSubject() {
    let currentEvent: Event
    this.eventSubject
      .pipe(
        concatMap(async event => {
          currentEvent = event
          try {
            for await (const nextState of this.mapEventToState(event)) {
              if (this.currentState === nextState || this.stateSubject.isStopped) return
              return nextState
            }
          } catch (error) {
            this.onError(error)
          }
        })
      )
      .subscribe(
        async state => {
          if (typeof state !== 'undefined') {
            const transition = new Transition(this.currentState, currentEvent, state)
            BlocSupervisor.delegate.onTransition(this, transition)
            this.onTransition(transition)
            this.stateSubject.next(state)
          }
        },
        error => {
          BlocSupervisor.delegate.onError(this, error)
          this.onError(error)
        }
      )
  }
}
