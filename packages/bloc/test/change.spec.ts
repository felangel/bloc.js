import { Change } from '../lib/bloc'
import { CounterState } from './helpers/counter/counter.state'

describe('change', () => {
  it('should create a change object', () => {
    expect.assertions(2)
    const current = new CounterState(0)
    const nextState = current.ready(1)
    const change = new Change(current, nextState)

    expect(change.current).toBe(current)
    expect(change.current).toBe(current)
  })
})
