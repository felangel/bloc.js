import { Transition } from '../lib/bloc'
import { CounterEvent } from './test-helpers'

describe('Transition', () => {
  it('is instantiable', () => {
    const transition = new Transition<CounterEvent, number>(0, CounterEvent.increment, 1)
    expect(transition).toBeInstanceOf(Transition)
    expect(transition.state).toEqual(0)
    expect(transition.event).toEqual(CounterEvent.increment)
    expect(transition.nextState).toEqual(1)
  })
})
