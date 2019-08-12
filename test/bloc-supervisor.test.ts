import { BlocSupervisor, BlocDelegate } from '../lib/bloc-js'
import { MyBlocDelegate } from './test-helpers'

describe('BlocSupervisor', () => {
  it('is singleton with default delegate', () => {
    expect(BlocSupervisor.delegate).toBeInstanceOf(BlocDelegate)
  })

  it('can set delegate', () => {
    BlocSupervisor.delegate = new MyBlocDelegate()
    expect(BlocSupervisor.delegate).toBeInstanceOf(MyBlocDelegate)
  })
})
