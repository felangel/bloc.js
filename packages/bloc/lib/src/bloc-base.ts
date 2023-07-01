import { Observable, Subject, Subscription } from "rxjs";
import { BlocObserver } from "./bloc-observer";
import { Bloc } from "./bloc";
import { EventStreamClosedError } from "./errors";

export class BlocBase<State> extends Observable<State> {

    constructor(private _state: State) {
        super();
    }

    _stateSubject = new Subject<State>();

    _blocObserver = Bloc.observer;

    _emitted: boolean = false;

    get state(): State {
        return this._state;
    }

    get isClosed(): boolean {
        return this._stateSubject.closed;
    }

    emit(state: State): void {
        try {
            if (this.isClosed) {
                throw new EventStreamClosedError();
            }
            if (state == this._state && this._emitted) return;

            this._state = state;
            this._stateSubject.next(this._state);
            this._emitted = true;
        }
        catch (e) {
            this.addError(e);
            throw Error("Error While Emitting State");
        }
    }

    addError(error: any): void {
        this.onError(error);
    }

    onChange(_currentState: State, _nextState: State): void {
        this._blocObserver.onChange(this, _currentState, _nextState)
    }

    onError(error: any): void {
        this._blocObserver.onError(this, error);
    }

    close(): void {
        this._stateSubject.complete();
        this._blocObserver.onClose(this);
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
        return this._stateSubject.subscribe(onData, onError, onDone)
    }
}
