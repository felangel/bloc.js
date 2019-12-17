import { BlocDelegate, BlocSupervisor, Transition, EventStreamClosedError } from '../lib/bloc'
import {
  CounterBloc,
  CounterEvent,
  CounterBlocError,
  DistinctCounterBloc,
  SwitchMapCounterBloc
} from './test-helpers'

describe('CounterBloc', () => {
  let counterBloc: CounterBloc
  let blocDelegate: BlocDelegate

  beforeEach(() => {
    counterBloc = new CounterBloc()
    blocDelegate = BlocSupervisor.delegate
    spyOn(blocDelegate, 'onEvent').and.returnValue(undefined)
    spyOn(blocDelegate, 'onTransition').and.returnValue(undefined)
    spyOn(blocDelegate, 'onError').and.returnValue(undefined)
  })

  afterEach(() => {
    counterBloc.dispose()
  })

  it('is instantiable', () => {
    expect(counterBloc).toBeInstanceOf(CounterBloc)
  })

  it('has correct initial state', () => {
    expect(counterBloc.initialState()).toEqual(0)
  })

  it('has correct state', () => {
    expect(counterBloc.state).toEqual(0)
  })

  it('has correct state stream before events are added', async done => {
    counterBloc.listen(state => {
      expect(state).toEqual(0)
      done()
    })
  })

  it('has correct state after a single event is added', async done => {
    const emittedStates: number[] = []
    counterBloc.listen(
      state => {
        emittedStates.push(state)
      },
      undefined,
      () => {
        expect(emittedStates).toEqual([0, 1])
        expect(blocDelegate.onEvent).toBeCalledWith(counterBloc, CounterEvent.increment)
        expect(blocDelegate.onTransition).toBeCalledWith(
          counterBloc,
          new Transition(0, CounterEvent.increment, 1)
        )
        expect(blocDelegate.onError).not.toBeCalled()
        done()
      }
    )
    counterBloc.add(CounterEvent.increment)
    setTimeout(() => {
      counterBloc.dispose()
    }, 0)
  })

  it('has correct state after a multiple events are added', async done => {
    const emittedStates: number[] = []
    counterBloc.listen(
      state => {
        emittedStates.push(state)
      },
      undefined,
      () => {
        expect(emittedStates).toEqual([0, 1, 2, 3])
        expect(blocDelegate.onEvent).toBeCalledWith(counterBloc, CounterEvent.increment)
        expect(blocDelegate.onEvent).toBeCalledTimes(3)
        expect(blocDelegate.onTransition).toBeCalledWith(
          counterBloc,
          new Transition(0, CounterEvent.increment, 1)
        )
        expect(blocDelegate.onTransition).toBeCalledWith(
          counterBloc,
          new Transition(1, CounterEvent.increment, 2)
        )
        expect(blocDelegate.onTransition).toBeCalledWith(
          counterBloc,
          new Transition(2, CounterEvent.increment, 3)
        )
        expect(blocDelegate.onTransition).toBeCalledTimes(3)
        expect(blocDelegate.onError).not.toBeCalled()
        done()
      }
    )
    counterBloc.add(CounterEvent.increment)
    counterBloc.add(CounterEvent.increment)
    counterBloc.add(CounterEvent.increment)
    setTimeout(() => {
      counterBloc.dispose()
    }, 0)
  })

  it('has correct state when mapEventToState yields the same state', async done => {
    const emittedStates: number[] = []
    counterBloc.listen(
      state => {
        emittedStates.push(state)
      },
      undefined,
      () => {
        expect(emittedStates).toEqual([0])
        expect(blocDelegate.onEvent).toBeCalledWith(counterBloc, CounterEvent.doNothing)
        expect(blocDelegate.onTransition).not.toBeCalled()
        expect(blocDelegate.onError).not.toBeCalled()
        done()
      }
    )
    counterBloc.add(CounterEvent.doNothing)
    setTimeout(() => {
      counterBloc.dispose()
    }, 0)
  })

  it('has correct state when transform used to filter distinct events', async done => {
    counterBloc = new DistinctCounterBloc()
    const emittedStates: number[] = []
    counterBloc.listen(
      state => {
        emittedStates.push(state)
      },
      undefined,
      () => {
        expect(emittedStates).toEqual([0, 1])
        expect(blocDelegate.onEvent).toBeCalledWith(counterBloc, CounterEvent.increment)
        expect(blocDelegate.onTransition).toBeCalledWith(
          counterBloc,
          new Transition(0, CounterEvent.increment, 1)
        )
        expect(blocDelegate.onError).not.toBeCalled()
        done()
      }
    )
    counterBloc.add(CounterEvent.increment)
    counterBloc.add(CounterEvent.increment)
    setTimeout(() => {
      counterBloc.dispose()
    }, 0)
  })

  it('has correct state when transform used to switchMap events', async done => {
    counterBloc = new SwitchMapCounterBloc()
    const emittedStates: number[] = []
    counterBloc.listen(
      state => {
        emittedStates.push(state)
      },
      undefined,
      () => {
        expect(emittedStates).toEqual([0, -1])
        expect(blocDelegate.onEvent).toBeCalledWith(counterBloc, CounterEvent.decrement)
        expect(blocDelegate.onTransition).toBeCalledWith(
          counterBloc,
          new Transition(0, CounterEvent.decrement, -1)
        )
        expect(blocDelegate.onError).not.toBeCalled()
        done()
      }
    )
    counterBloc.add(CounterEvent.increment)
    counterBloc.add(CounterEvent.decrement)
    setTimeout(() => {
      counterBloc.dispose()
    }, 0)
  })

  it('has correct state when mapEventToState throws exception', async done => {
    const emittedStates: number[] = []
    counterBloc.listen(
      state => {
        emittedStates.push(state)
      },
      undefined,
      () => {
        expect(emittedStates).toEqual([0])
        expect(blocDelegate.onEvent).toBeCalledWith(counterBloc, CounterEvent.badEvent)
        expect(blocDelegate.onTransition).not.toBeCalled()
        expect(blocDelegate.onError).toBeCalledWith(counterBloc, new CounterBlocError())
        expect(blocDelegate.onError).toBeCalledTimes(1)
        done()
      }
    )
    counterBloc.add(CounterEvent.badEvent)
    setTimeout(() => {
      counterBloc.dispose()
    }, 0)
  })

  it('cannot add after dispose called', () => {
    counterBloc.dispose()
    counterBloc.add(CounterEvent.increment)

    expect(blocDelegate.onError).toBeCalledWith(counterBloc, new EventStreamClosedError())
    expect(blocDelegate.onError).toBeCalledTimes(1)
  })
})
