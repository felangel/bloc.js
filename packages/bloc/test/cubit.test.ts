import { CounterCubit } from './cubit-test-helpers'
import { BlocObserver } from '../lib/src/bloc-observer'
import { Cubit } from '../lib/src/cubit'
import { CounterBloc, CounterBlocError, CounterEvent } from './bloc-test-helpers'
import { EmitStateSubjectClosedError } from '../lib/src/errors'

describe('CounterCubit', () => {
  let counterCubit: CounterCubit
  let blocObserver: BlocObserver

  beforeEach(() => {
    counterCubit = new CounterCubit()
    blocObserver = Cubit.observer
    spyOn(blocObserver, 'onChange').and.returnValue(undefined)
    spyOn(blocObserver, 'onError').and.returnValue(undefined)
  })

  afterEach(() => {
    counterCubit.close()
  })

  describe('Initial state', () => {
    test('is correct', () => {
      expect(counterCubit.state).toEqual(0)
    })
  })

  describe('Errors', () => {
    test('calls onError after close called', () => {
      counterCubit.close()
      counterCubit.increment()

      expect(blocObserver.onError).toBeCalledWith(counterCubit, new EmitStateSubjectClosedError())
      expect(blocObserver.onError).toBeCalledTimes(1)
    })

  })

  describe('Same state', () => {
    test('dont call onChange when emitting same state ', () => {
      counterCubit.increment()
      counterCubit.doNothing()

      expect(blocObserver.onChange).toBeCalledTimes(1)
    })
  })

  test('has correct state after multiple emit', () => {

    const emittedStates: number[] = []

    counterCubit.listen(state => {
      emittedStates.push(state)
    }, undefined, () => expect(emittedStates).toEqual([1, 2, 1]))

    counterCubit.increment()
    counterCubit.increment()
    counterCubit.decremet()
    setTimeout(() => {
      counterCubit.close()
    }, 0)
  })
})
