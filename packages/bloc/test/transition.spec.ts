import { Transition } from '../lib/bloc'
import { CounterIncrementEvent } from './helpers/counter/counter.event'
import { CounterState } from './helpers/counter/counter.state'

describe('transition', () => {
  it('should create a transition object', () => {
    expect.assertions(3)
    const current = new CounterState(0)
    const next = current.ready(1)
    const event = new CounterIncrementEvent()
    const transition = new Transition(current, event, next)

    expect(transition.currentState).toBe(current)
    expect(transition.event).toBe(event)
    expect(transition.nextState).toBe(next)
  })
})
