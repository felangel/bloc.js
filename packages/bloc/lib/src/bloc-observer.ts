import { Bloc, Transition } from '../bloc'

/**
 * An interface for observing the behavior of all `Bloc` instances.
 *
 * @export
 * @class BlocObserver
 */
export class BlocObserver {
  /**
   * Called whenever an `event` is added to any `bloc`.
   *
   * @param {Bloc<any, any>} _bloc
   * @param {*} _event
   * @memberof BlocObserver
   */
  onEvent(_bloc: Bloc<any, any>, _event: any): void {}

  /**
   * Called whenever a `transition` occurs in any `bloc`.
   *
   * @param {Bloc<any, any>} _bloc
   * @param {Transition<any, any>} _transition
   * @memberof BlocObserver
   */
  onTransition(_bloc: Bloc<any, any>, _transition: Transition<any, any>): void {}

  /**
   * Called whenever an `error` occurs in any `bloc`.
   *
   * @param {Bloc<any, any>} _bloc
   * @param {*} _error
   * @memberof BlocObserver
   */
  onError(_bloc: Bloc<any, any>, _error: any): void {}
}
