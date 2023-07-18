import { BlocBase } from './bloc_base'
import { Change } from './change'
import { Bloc } from './bloc'
import { Transition } from './transition'

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
   * Called whenever a [Change] occurs in any [bloc]
   * A [change] occurs when a new state is emitted.
   * [onChange] is called before a bloc's state has been updated.
   */
  onChange(_bloc: BlocBase<any>, _change: Change<any>): void {
    return
  }

}
