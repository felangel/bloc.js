import {
  EMPTY,
  from,
  Observable,
  Subject,
  Subscription,
} from 'rxjs';

import { catchError, filter, mergeMap } from "rxjs/operators"
import { BlocBase } from './base';
import { BlocObserver } from './bloc-observer';
import { Emitter, _Emitter } from './emitter';
import { StateError } from './errors';
import { BlocEvent } from './event';
import { Transition } from './transition';
import {
  EventHandler,
  ClassType,
  EventTransformer,
} from './types';

export abstract class Bloc<
  Event extends BlocEvent,
  State
> extends BlocBase<State> {
  constructor(state: State) {
    super(state);
    this.on = this.on.bind(this);
    this.add = this.add.bind(this);
    this.emit = this.emit.bind(this);
  }

  private readonly _eventSubject$ = new Subject<Event>();
  private readonly _eventMap = new WeakMap<ClassType<Event>, 1>();
  private readonly _subscriptions = new Set<Subscription>();
  private readonly _emitters = new Set<Emitter<State>>();
  readonly isBlocInstance = true;
  
  static transformer<T>():EventTransformer<T> {
    return (events$, mapper) =>
        events$.pipe(mergeMap(mapper));
  } 


  private _mapEventToStateError(error: Error): Observable<never> {
    this.onError(error);
    return EMPTY;
  }

  protected override onError(error: Error): void {
    Bloc.observer.onError(this, error);
  }

  protected onTransition(transition: Transition<Event, State>): void {
    Bloc.observer.onTransition(this, transition);
  }

  protected onEvent(event: Event): void {
    Bloc.observer.onEvent(this, event);
  }

  protected on<T extends Event>(
    event: ClassType<T>,
    eventHandler: EventHandler<T, State>,
    transformer?: EventTransformer<T>
  ): void {
    if (this._eventMap.has(event)) {
      throw new Error(`${event.name} can only have one EventHandler`);
    }

    this._eventMap.set(event, 1);

    const mapEventToState = (event: T): Observable<void> => {
      const stateToBeEmittedStream$ = new Subject<State>();
      let isClosed = false

      const onEmit = (
        nextState: State 
      ): void => {
        if (isClosed) {
          return;
        }

        if (this.state === nextState && this._emitted) return; 

        try {
          this.onTransition(
            new Transition(this.state, event, nextState)
          );
          stateToBeEmittedStream$.next(nextState);
        } catch (error) {
          this.onError(error as Error);
        }
        
      };

      const _emitter = new _Emitter(onEmit.bind(this))

      const _callableEmitter = (state: State) => _emitter.call(state)

      _callableEmitter.close = () => {
        isClosed = true
        _emitter.close()
      } 

      _callableEmitter.onEach = <T>(
        stream$: Observable<T>,
        onData: (data: T) => void,
        onError?: (error: Error) => void
      ) => _emitter.onEach(stream$, onData, onError)

      _callableEmitter.forEach = <T>(
        stream$: Observable<T>,
        onData: (data: T) => State,
        onError?: (error: Error) => State
      ) => _emitter.forEach(stream$, onData, onError)
      
      this._emitters.add(_callableEmitter);

      return new Observable((subscriber) => {
        stateToBeEmittedStream$.subscribe(this.emit);

        const result = eventHandler.call(this, event, _callableEmitter);

        if (result instanceof Promise) {
          from(result).subscribe({
            complete: () => subscriber.complete(),
          });
        } else {
          subscriber.complete();
        }

        return () => {
          _callableEmitter.close();
          this._emitters.delete(_callableEmitter)
          stateToBeEmittedStream$.complete()
        };
      });
    };

    const _transformer = transformer ?? Bloc.transformer()

    const transformStream$ = _transformer(
      this._eventSubject$.pipe(
        filter((newEvent): newEvent is T => newEvent instanceof event)
      ),
      mapEventToState
    );

    const subscription = transformStream$
      .pipe(catchError((error: Error) => this._mapEventToStateError(error)))
      .subscribe();

    this._subscriptions.add(subscription);
  }


  static observer: BlocObserver = new BlocObserver();

  add(event: Event) {
    if (!this._eventMap.has(event.constructor as ClassType<Event>)) {
      throw new StateError(`
        add(${event.blockEventName}) was called without a registered event handler.
        Make sure to register a handler via on(${event.blockEventName}, (event, emit) {...})
      `)
    }

    try {
      this.onEvent(event);
      this._eventSubject$.next(event);
    } catch (error) {
      this.onError(error as Error);
    }

    return this;
  }

  override close(): void {
    this._emitters.forEach((emitter) => emitter.close());
    this._subscriptions.forEach((subscription) => subscription.unsubscribe());
    this._emitters.clear();
    this._subscriptions.clear();
    super.close();
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const isBlocInstance = (bloc: any): bloc is Bloc<any, any> => {
  return bloc instanceof Bloc || Boolean(bloc.isBlocInstance);
};
