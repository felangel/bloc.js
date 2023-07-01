import { Bloc, Transition } from '../bloc'
import { BlocBase } from './bloc-base';

/**
 * An interface for observing the behavior of all `Bloc` instances.
 *
 * @export
 * @class BlocObserver
 */
export class BlocObserver {
  /**
   * Called whenever an `state` is added to any `bloc`.
   *
   * @param {Bloc<any, any>} _bloc
   * @param {*} _currentState Current State
   * @param {*} _state new State
   * @memberof BlocObserver
   */
  onChange(_bloc: BlocBase<any>, _currentState: any, _state: any): void {
    return
  }

  /**
   * Called whenever an `event` is added to any `bloc`.
   *
   * @param {Bloc<any, any>} _bloc
   * @param {*} _event
   * @memberof BlocObserver
   */
  onEvent(_bloc: Bloc<any, any>, _event: any): void {
    return
  }

  /**
   * Called whenever a `transition` occurs in any `bloc`.
   *
   * @param {Bloc<any, any>} _bloc
   * @param {Transition<any, any>} _transition
   * @memberof BlocObserver
   */
  onTransition(_bloc: Bloc<any, any>, _transition: Transition<any, any>): void {
    return
  }

  /**
   * Called whenever an `error` occurs in any `bloc`.
   *
   * @param {Bloc<any, any>} _bloc
   * @param {*} _error
   * @memberof BlocObserver
   */
  onError(_bloc: BlocBase<any>, _error: any): void {
    return
  }

  /**
 * Called whenever the `bloc` close
 *
 * @param {Bloc<any, any>} _bloc
 * @param {*} _error
 * @memberof BlocObserver
 */
  onClose(_bloc: BlocBase<any>) {
    return;
  }
}
