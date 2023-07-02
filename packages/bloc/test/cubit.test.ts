import { count } from 'console'
import { BlocObserver, Transition, EventStreamClosedError, Bloc, BadState } from '../lib/bloc'
import {
    CounterCubit,
} from './test-helpers'

describe('counterCubit', () => {
    let counterCubit: CounterCubit
    let blocObserver: BlocObserver

    beforeEach(() => {
        counterCubit = new CounterCubit();
        blocObserver = Bloc.observer
        spyOn(blocObserver, 'onChange').and.returnValue(undefined)
        spyOn(blocObserver, 'onError').and.returnValue(undefined)
    })

    afterEach(() => {
        counterCubit.close()
    })

    it('is instantiable', () => {
        expect(counterCubit).toBeInstanceOf(CounterCubit)
    })

    it('has correct initial state', () => {
        expect(counterCubit.state).toEqual(0)
    })

    it('has correct state stream before events are added', async done => {
        const emittedStates: number[] = []
        counterCubit.listen(
            state => {
                emittedStates.push(state)
            },
            undefined,
            () => {
                expect(emittedStates).toEqual([])
                done()
            }
        )
        setTimeout(() => {
            counterCubit.close()
        }, 0)
    })

    it('has correct state after a single event is added', async done => {
        const emittedStates: number[] = []
        counterCubit.listen(
            state => {
                emittedStates.push(state)
            },
            undefined,
            () => {
                expect(emittedStates).toEqual([1])
                expect(blocObserver.onChange).toBeCalledWith(counterCubit, 0, 1);
                expect(blocObserver.onError).not.toBeCalled()
                done()
            }
        )
        counterCubit.increment();
        setTimeout(() => {
            counterCubit.close()
        }, 0)
    })

    it('has correct state after a multiple events are added', async done => {
        const emittedStates: number[] = []
        counterCubit.listen(
            state => {
                emittedStates.push(state)
            },
            undefined,
            () => {
                expect(emittedStates).toEqual([1, 2, 3])
                expect(blocObserver.onChange).toBeCalledWith(counterCubit, 0, 1);
                expect(blocObserver.onChange).toBeCalledTimes(3)
                expect(blocObserver.onError).not.toBeCalled()
                done()
            }
        )
        counterCubit.increment()
        counterCubit.increment()
        counterCubit.increment()
        setTimeout(() => {
            counterCubit.close()
        }, 0)
    })

    it('has correct state when mapEventToState yields the same state', async done => {
        const emittedStates: number[] = []
        counterCubit.listen(
            state => {
                emittedStates.push(state)
            },
            undefined,
            () => {
                expect(emittedStates).toEqual([0])
                expect(blocObserver.onChange).toBeCalledWith(counterCubit, 0, 0);
                expect(blocObserver.onError).not.toBeCalled()
                done()
            }
        )
        counterCubit.doNothing();
        setTimeout(() => {
            counterCubit.close()
        }, 0)
    })

    it('has correct state when mapEventToState yields the same state multiple times', async done => {
        const emittedStates: number[] = []
        counterCubit.listen(
            state => {
                emittedStates.push(state)
            },
            undefined,
            () => {
                expect(emittedStates).toEqual([0])
                expect(blocObserver.onChange).toBeCalledWith(counterCubit, 0, 0);
                expect(blocObserver.onError).not.toBeCalled()
                done()
            }
        )
        counterCubit.doNothing();
        counterCubit.doNothing();
        setTimeout(() => {
            counterCubit.close()
        }, 0)
    })



    it('cannot add after close called', () => {
        counterCubit.close()

        expect(() => counterCubit.increment()).toThrow("Cannot Emit New States After Cubit Closed");
        expect(blocObserver.onError).toBeCalledWith(counterCubit, new BadState())
        expect(blocObserver.onError).toBeCalledTimes(1)
    })
})
