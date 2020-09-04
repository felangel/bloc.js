import { BlocObserver, Transition, EventStreamClosedError, Bloc } from '../lib/bloc'
import {
  CounterBloc,
  CounterEvent,
  CounterBlocError,
  DistinctCounterBloc,
  SwitchMapCounterBloc
} from './test-helpers'

describe('CounterBloc', () => {
  let counterBloc: CounterBloc
  let blocObserver: BlocObserver

  beforeEach(() => {
    counterBloc = new CounterBloc()
    blocObserver = Bloc.observer
    spyOn(blocObserver, 'onEvent').and.returnValue(undefined)
    spyOn(blocObserver, 'onTransition').and.returnValue(undefined)
    spyOn(blocObserver, 'onError').and.returnValue(undefined)
  })

  afterEach(() => {
    counterBloc.close()
  })

  it('is instantiable', () => {
    expect(counterBloc).toBeInstanceOf(CounterBloc)
  })

  it('has correct initial state', () => {
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
        expect(blocObserver.onEvent).toBeCalledWith(counterBloc, CounterEvent.increment)
        expect(blocObserver.onTransition).toBeCalledWith(
          counterBloc,
          new Transition(0, CounterEvent.increment, 1)
        )
        expect(blocObserver.onError).not.toBeCalled()
        done()
      }
    )
    counterBloc.add(CounterEvent.increment)
    setTimeout(() => {
      counterBloc.close()
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
        expect(blocObserver.onEvent).toBeCalledWith(counterBloc, CounterEvent.increment)
        expect(blocObserver.onEvent).toBeCalledTimes(3)
        expect(blocObserver.onTransition).toBeCalledWith(
          counterBloc,
          new Transition(0, CounterEvent.increment, 1)
        )
        expect(blocObserver.onTransition).toBeCalledWith(
          counterBloc,
          new Transition(1, CounterEvent.increment, 2)
        )
        expect(blocObserver.onTransition).toBeCalledWith(
          counterBloc,
          new Transition(2, CounterEvent.increment, 3)
        )
        expect(blocObserver.onTransition).toBeCalledTimes(3)
        expect(blocObserver.onError).not.toBeCalled()
        done()
      }
    )
    counterBloc.add(CounterEvent.increment)
    counterBloc.add(CounterEvent.increment)
    counterBloc.add(CounterEvent.increment)
    setTimeout(() => {
      counterBloc.close()
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
        expect(blocObserver.onEvent).toBeCalledWith(counterBloc, CounterEvent.doNothing)
        expect(blocObserver.onTransition).not.toBeCalled()
        expect(blocObserver.onError).not.toBeCalled()
        done()
      }
    )
    counterBloc.add(CounterEvent.doNothing)
    setTimeout(() => {
      counterBloc.close()
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
        expect(blocObserver.onEvent).toBeCalledWith(counterBloc, CounterEvent.increment)
        expect(blocObserver.onTransition).toBeCalledWith(
          counterBloc,
          new Transition(0, CounterEvent.increment, 1)
        )
        expect(blocObserver.onError).not.toBeCalled()
        done()
      }
    )
    counterBloc.add(CounterEvent.increment)
    counterBloc.add(CounterEvent.increment)
    setTimeout(() => {
      counterBloc.close()
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
        expect(blocObserver.onEvent).toBeCalledWith(counterBloc, CounterEvent.decrement)
        expect(blocObserver.onTransition).toBeCalledWith(
          counterBloc,
          new Transition(0, CounterEvent.decrement, -1)
        )
        expect(blocObserver.onError).not.toBeCalled()
        done()
      }
    )
    counterBloc.add(CounterEvent.increment)
    counterBloc.add(CounterEvent.decrement)
    setTimeout(() => {
      counterBloc.close()
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
        expect(blocObserver.onEvent).toBeCalledWith(counterBloc, CounterEvent.badEvent)
        expect(blocObserver.onTransition).not.toBeCalled()
        expect(blocObserver.onError).toBeCalledWith(counterBloc, new CounterBlocError())
        expect(blocObserver.onError).toBeCalledTimes(1)
        done()
      }
    )
    counterBloc.add(CounterEvent.badEvent)
    setTimeout(() => {
      counterBloc.close()
    }, 0)
  })

  it('cannot add after close called', () => {
    counterBloc.close()
    counterBloc.add(CounterEvent.increment)

    expect(blocObserver.onError).toBeCalledWith(counterBloc, new EventStreamClosedError())
    expect(blocObserver.onError).toBeCalledTimes(1)
  })
})
