import { BlocDelegate, Transition } from '../lib/bloc'
import { CounterBloc, CounterEvent, CounterBlocError } from './test-helpers'

describe('BlocDelegate', () => {
  let blocDelegate: BlocDelegate
  let counterBloc: CounterBloc

  beforeEach(() => {
    blocDelegate = new BlocDelegate()
    counterBloc = new CounterBloc()
  })

  it('is instantiable', () => {
    expect(blocDelegate).toBeInstanceOf(BlocDelegate)
  })

  it('onError returns undefined', () => {
    expect(blocDelegate.onError(counterBloc, new CounterBlocError('oops'))).toBeUndefined()
  })

  it('onEvent returns undefined', () => {
    expect(blocDelegate.onEvent(counterBloc, CounterEvent.increment)).toBeUndefined()
  })

  it('onTransition returns undefined', () => {
    expect(
      blocDelegate.onTransition(counterBloc, new Transition(0, CounterEvent.increment, 1))
    ).toBeUndefined()
  })
})
