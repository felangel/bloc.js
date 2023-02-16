import { Observable, Subscription, Subject } from 'rxjs';
import { Bloc } from './bloc';
import { Change } from './change';
import { StateError } from './errors';

export abstract class BlocBase<State = unknown> {
  constructor(state: State) {
    this._state = state;
    this._stateSubject$ = new Subject();
    this.state$ = this._stateSubject$;
    this.name = this.constructor.name;
    this._stateSubscription = this._subscribeToState();
    this.onCreate();
  }

  readonly name: string;
  readonly state$: Observable<State>;
  protected _isClosed = false;
  protected _emitted = false;
  private _state: State;
  private readonly _stateSubject$: Subject<State>;
  private readonly _stateSubscription: Subscription;

  get state(): State {
    return this._state;
  }

  get isClosed() {
    return this._isClosed;
  }

  private _subscribeToState(): Subscription {
    return this.state$.subscribe();
  }

  protected onCreate() {
    Bloc.observer.onCreate(this);
  }

  protected onError(error: Error): void {
    Bloc.observer.onError(this, error);
  }

  protected onChange(change: Change<State>): void {
    Bloc.observer.onChange(this, change);
  }

  protected onClose() {
    Bloc.observer.onClose(this);
  }

  protected emit(newState: State): void {
    try {
      if (this._isClosed) {
        throw new StateError("Cannot emit new states after calling close")
      }

      if (newState == this._state && this._emitted) return;
      this.onChange(new Change(this.state, newState));
      this._state = newState;
      this._stateSubject$.next(newState);
      this._emitted = true
    } catch (error) {
      this.onError(error as Error)
    }
  }

  close() {
    this._isClosed = true;
    this._stateSubject$.complete();
    this._stateSubscription.unsubscribe();
    this.onClose();
  }
}
