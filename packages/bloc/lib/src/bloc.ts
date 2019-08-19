import { BehaviorSubject, Subject, Observable, OperatorFunction, from } from 'rxjs'
import { concatMap } from 'rxjs/operators'
import { BlocSupervisor } from './bloc-supervisor'
import { Transition } from './transition'
import { EventStreamClosedError } from './errors'

export type NextFunction<Event, State> = (value: Event, index: number) => Promise<State | undefined>

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
      BlocSupervisor.delegate.onError(this, error)
      this.onError(error)
    }
  }

  dispose() {
    this.stateSubject.complete()
    this.eventSubject.complete()
  }

  transform(events: Observable<Event>, next: NextFunction<Event, State>) {
    return events.pipe(concatMap(next))
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
    this.transform(this.eventSubject, async (event: Event) => {
      currentEvent = event
      try {
        for await (const nextState of this.mapEventToState(event)) {
          if (this.currentState === nextState || this.stateSubject.isStopped) return
          return nextState
        }
      } catch (error) {
        BlocSupervisor.delegate.onError(this, error)
        this.onError(error)
      }
    }).subscribe((nextState: State | undefined) => {
      if (typeof nextState === 'undefined') {
        return
      }
      const transition = new Transition(this.currentState, currentEvent, nextState)
      BlocSupervisor.delegate.onTransition(this, transition)
      this.onTransition(transition)
      this.stateSubject.next(nextState)
    })

    // this.eventSubject
    //   .pipe(
    //     concatMap(async event => {
    //       currentEvent = event
    //       try {
    //         for await (const nextState of this.mapEventToState(event)) {
    //           if (this.currentState === nextState || this.stateSubject.isStopped) return
    //           return nextState
    //         }
    //       } catch (error) {
    //         BlocSupervisor.delegate.onError(this, error)
    //         this.onError(error)
    //       }
    //     })
    //   )
    //   .subscribe(async state => {
    //     if (typeof state !== 'undefined') {
    //       const transition = new Transition(this.currentState, currentEvent, state)
    //       BlocSupervisor.delegate.onTransition(this, transition)
    //       this.onTransition(transition)
    //       this.stateSubject.next(state)
    //     }
    //   })
  }
}
