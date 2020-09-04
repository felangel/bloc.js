import { Observable, Subject, EMPTY, Subscription } from 'rxjs'
import { catchError, concatMap, map } from 'rxjs/operators'
import { BlocObserver, EventStreamClosedError, Transition } from '../bloc'

export type NextFunction<Event, State> = (value: Event) => Observable<Transition<Event, State>>

export abstract class Bloc<Event, State> extends Observable<State> {
  private static _observer: BlocObserver = new BlocObserver()

  private emitted: boolean = false
  private eventSubject = new Subject<Event>()
  private stateSubject: Subject<State>
  private transitionSubscription: Subscription = Subscription.EMPTY

  static get observer(): BlocObserver {
    return this._observer
  }

  static set observer(value: BlocObserver) {
    this._observer = value
  }

  get state(): State {
    return this._state
  }

  listen(
    onData: (value: State) => void,
    onError?: ((onError: any) => any) | undefined,
    onDone?: (() => any) | undefined
  ): Subscription {
    return this.stateSubject.subscribe(onData, onError, onDone)
  }

  constructor(private _state: State) {
    super()
    this.stateSubject = new Subject()
    this.bindStateSubject()
  }

  abstract mapEventToState(event: Event): AsyncIterableIterator<State>

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

  close(): void {
    this.stateSubject.complete()
    this.eventSubject.complete()
    this.transitionSubscription.unsubscribe()
  }

  transformEvents(
    events: Observable<Event>,
    next: NextFunction<Event, State>
  ): Observable<Transition<Event, State>> {
    return events.pipe(concatMap(next))
  }

  transformTransitions(
    transitions: Observable<Transition<Event, State>>
  ): Observable<Transition<Event, State>> {
    return transitions
  }

  onEvent(event: Event): void {
    Bloc.observer.onEvent(this, event)
    return
  }

  onTransition(transition: Transition<Event, State>): void {
    Bloc.observer.onTransition(this, transition)
    return
  }

  onError(error: any): void {
    Bloc.observer.onError(this, error)
    return
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
      if (transition.nextState == this.state && this.emitted) return
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
