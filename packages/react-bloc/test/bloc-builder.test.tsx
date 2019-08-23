import { BlocBuilder } from '../lib/react-bloc'
import * as React from 'react'
import { Bloc } from '@felangel/bloc'
import { shallow, mount, ReactWrapper } from 'enzyme'
import 'jsdom-global/register'

enum CounterEvent {
  increment,
  decrement
}
class CounterBloc extends Bloc<CounterEvent, number> {
  initialState(): number {
    return 0
  }

  async *mapEventToState(event: CounterEvent) {
    switch (event) {
      case CounterEvent.increment:
        yield this.currentState + 1
        break
      case CounterEvent.decrement:
        yield this.currentState - 1
        break
    }
  }
}

class CounterApp extends React.Component {
  private bloc: CounterBloc = new CounterBloc()
  constructor(_: any) {
    super(_)
    this.dispatchEvent = this.dispatchEvent.bind(this)
  }
  dispatchEvent() {
    this.bloc.dispatch(CounterEvent.increment)
  }
  render() {
    return (
      <div id="CounterExample">
        <h1>CounterApp</h1>
        <BlocBuilder<CounterBloc, number>
          bloc={this.bloc}
          condition={(previousState, currentState) => {
            return (previousState + currentState) % 3 === 0
          }}
          builder={count => {
            return <p id="counter-condition-tag">{count}</p>
          }}
        />
        <BlocBuilder<CounterBloc, number>
          bloc={this.bloc}
          builder={count => {
            return <p id="normal-counter-tag">{count}</p>
          }}
        />
        <button onClick={this.dispatchEvent}></button>
      </div>
    )
  }
}

describe('BlocProvider', () => {
  it('renders the component properly', () => {
    const wrapper = mount(<CounterApp />)
    expect(wrapper.find('div').length).toBe(1)
    expect(wrapper.find('button').length).toBe(1)
    expect(wrapper.find('BlocBuilder').length).toBe(2)
    expect(wrapper.find('p').length).toBe(2)
  })

  it('passes the initial state to the component', () => {
    const wrapper = mount(<CounterApp />)
    const normalText = wrapper.find('#normal-counter-tag')
    const conditionalText = wrapper.find('#counter-condition-tag')
    expect(conditionalText.text().includes('0')).toBe(true)
    expect(conditionalText.text().includes('0')).toBe(true)
    expect(normalText.text().includes('0')).toBe(true)
    expect(normalText.text().includes('0')).toBe(true)
  })

  it('receives events and sends state updates to the component', async () => {
    let spy = jest.spyOn(CounterApp.prototype, 'dispatchEvent')
    const wrapper = mount(<CounterApp />)

    let normalText = wrapper.find('#normal-counter-tag')
    const conditionalText = wrapper.find('#counter-condition-tag')
    expect(normalText.text().includes('0')).toBe(true)
    expect(normalText.text().includes('0')).toBe(true)
    expect(conditionalText.text().includes('0')).toBe(true)
    expect(conditionalText.text().includes('0')).toBe(true)

    expect(spy).not.toHaveBeenCalled()
    expect(wrapper.find('button').length).toBe(1)
    wrapper.find('button').simulate('click')
    expect(spy).toHaveBeenCalled()

    wrapper.update()
    wrapper.update()
    wrapper.update()
    wrapper.update()
    wrapper
      .find('BlocBuilder')
      .first()
      .update()
    normalText = wrapper.find('#normal-counter-tag')
    let blocBuilder = wrapper.find('BlocBuilder').first()
  })
})
