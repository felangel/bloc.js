import { BlocObserver, Transition, Bloc } from '../lib/bloc'
import { CounterBloc, CounterEvent, CounterBlocError, MyBlocObserver, CounterCubit } from './test-helpers'

describe('BlocObserver', () => {
  let blocObserver: BlocObserver
  let counterBloc: CounterBloc
  let counterCubit: CounterCubit;

  beforeEach(() => {
    blocObserver = new BlocObserver()
    counterBloc = new CounterBloc()
  })

  it('is instantiable', () => {
    expect(blocObserver).toBeInstanceOf(BlocObserver)
  })

  it('can be set', () => {
    Bloc.observer = new MyBlocObserver()
    expect(Bloc.observer).toBeInstanceOf(MyBlocObserver)
  })

  it('onError returns undefined', () => {
    expect(blocObserver.onError(counterBloc, new CounterBlocError('oops'))).toBeUndefined()
  })

  it('onEvent returns undefined', () => {
    expect(blocObserver.onEvent(counterBloc, CounterEvent.increment)).toBeUndefined()
  })

  it('onTransition returns undefined', () => {
    expect(
      blocObserver.onTransition(counterBloc, new Transition(0, CounterEvent.increment, 1))
    ).toBeUndefined()
  })
})
