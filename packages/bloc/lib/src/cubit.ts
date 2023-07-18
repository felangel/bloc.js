import { BlocBase } from './bloc_base'

/**
 *
 * A [Cubit] is similar to [Bloc] but has no notion of events
 * and relies on methods to [emit] new states.
 *
 * Every [Cubit] requires an initial state which will be the
 * state of the [Cubit] before [emit] has been called.
 *
 * The current state of a [Cubit] can be accessed via the [state] getter.
 *
 * @export
 * @abstract
 * @class Cubit
 * @extends {BlocBase<State>}
 * @template State
 */
export abstract class Cubit<State> extends BlocBase<State> {
}
