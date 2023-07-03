import { Observable, Subject, Subscription } from "rxjs";
import { Bloc } from "./bloc";
import { BadState } from "./errors";

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
        return this._stateSubject.isStopped;
    }

    /**
     * Update the given `state` with existing state and emits the new `state` to its
     * listeners
     * @param {State} state 
     * @memberof BlocBase
     */

    emit(state: State): void {
        try {
            if (this.isClosed) {
                throw new BadState();
            }
            if (state == this._state && this._emitted) return;

            this.onChange(this._state, state);
            this._state = state;
            this._stateSubject.next(this._state);
            this._emitted = true;
        }
        catch (e) {
            this.addError(e);
            throw e;
        }
    }

    /**
     * Called whenever an error is added while emitting and call onError.
     *
     * @param {Error} error
     * @memberof BlocBase
     */
    addError(error: any): void {
        this.onError(error);
    }

    /**
     * Called whenever a `change` occurs with the given `change`.
     * A `change` occurs when a new `state` is added.
     * `onChange` is called before a bloc's or cubit's state has been updated.
     *
     * @param {State} _currentState existing State that it currently hold
     * @param {State} _nextState new State which is to be updated
     * @memberof BlocBase
     */

    onChange(_currentState: State, _nextState: State): void {
        this._blocObserver.onChange(this, _currentState, _nextState)
    }

    /**
     * Called whenever an error is occured when emitting.
     *
     * @param {Error} error
     * @memberof BlocBase
     */
    onError(error: any): void {
        this._blocObserver.onError(this, error);
    }

    /**
     * This method should be called when a `Bloc` or `Cubit` is no longer needed.
     * Disposes the resources held by the bloc or cubit which means the `Bloc` or `Cubit` will
     * no longer process new events after `close` has been called.
     *
     * @memberof BlocBase
     */
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
