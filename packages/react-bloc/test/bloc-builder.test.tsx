import { BlocBuilder } from '../lib/react-bloc'
import * as React from 'react'
import { Bloc } from '@felangel/bloc'
import { shallow, mount, ReactWrapper } from 'enzyme'
import 'jsdom-global/register'
import ReactDOM from 'react-dom'

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

type CounterBlocProps<B> = {
  bloc: B
  title: string
}

class CounterApp extends React.Component<CounterBlocProps<CounterBloc>, any> {
  constructor(_: any) {
    super(_)
    this.dispatchEvent = this.dispatchEvent.bind(this)
  }
  dispatchEvent() {
    this.props.bloc.dispatch(CounterEvent.increment)
  }
  render() {
    return (
      <div id="CounterExample">
        <h1>{this.props.title}</h1>
        <BlocBuilder<CounterBloc, number>
          bloc={this.props.bloc}
          condition={(previousState, currentState) => {
            return (previousState + currentState) % 3 === 0
          }}
          builder={count => {
            return <p id="counter-condition-tag">{count}</p>
          }}
        />
        <BlocBuilder<CounterBloc, number>
          bloc={this.props.bloc}
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
    let bloc: CounterBloc = new CounterBloc()
    const wrapper = mount(<CounterApp title={'dsad'} bloc={bloc} />)
    expect(wrapper.find('div').length).toBe(1)
    expect(wrapper.find('button').length).toBe(1)
    expect(wrapper.find('BlocBuilder').length).toBe(2)
    expect(wrapper.find('p').length).toBe(2)
  })

  it('passes the initial state to the component', () => {
    let bloc: CounterBloc = new CounterBloc()
    const wrapper = mount(<CounterApp title={'dsad'} bloc={bloc} />)
    const normalText = wrapper.find('#normal-counter-tag')
    const conditionalText = wrapper.find('#counter-condition-tag')
    expect(conditionalText.text().includes('0')).toBe(true)
    expect(conditionalText.text().includes('0')).toBe(true)
    expect(normalText.text().includes('0')).toBe(true)
    expect(normalText.text().includes('0')).toBe(true)
  })

  it('passes the initial state to the component', () => {
    let bloc: CounterBloc = new CounterBloc()
    const wrapper = mount(<CounterApp title={'dsad'} bloc={bloc} />)
    const normalText = wrapper.find('#normal-counter-tag')
    const conditionalText = wrapper.find('#counter-condition-tag')
    expect(conditionalText.text().includes('0')).toBe(true)
    expect(conditionalText.text().includes('0')).toBe(true)
    expect(normalText.text().includes('0')).toBe(true)
    expect(normalText.text().includes('0')).toBe(true)
    wrapper.setProps({ title: '321312321' })
    wrapper.update()
  })

  it('receives events and sends state updates to the component', done => {
    let bloc: CounterBloc = new CounterBloc()
    const wrapper = mount(<CounterApp title={'dsad'} bloc={bloc} />)

    let normalText = wrapper.find('#normal-counter-tag')
    let conditionalText = wrapper.find('#counter-condition-tag')
    expect(normalText.text().includes('0')).toBe(true)
    expect(normalText.text().includes('0')).toBe(true)
    expect(conditionalText.text().includes('0')).toBe(true)
    expect(conditionalText.text().includes('0')).toBe(true)

    expect(wrapper.find('button').length).toBe(1)
    wrapper.find('button').simulate('click')
    wrapper.update()

    setImmediate(() => {
      expect(normalText.text().includes('1')).toBe(true)
      expect(conditionalText.text().includes('0')).toBe(true)
      wrapper.unmount()
      done()
    })
  })

  it('only rebuilds when condition evaluates to true', done => {
    let bloc: CounterBloc = new CounterBloc()
    const wrapper = mount(<CounterApp title={'dsad'} bloc={bloc} />)

    let normalText = wrapper.find('#normal-counter-tag')
    let conditionalText = wrapper.find('#counter-condition-tag')
    expect(normalText.text().includes('0')).toBe(true)
    expect(normalText.text().includes('0')).toBe(true)
    expect(conditionalText.text().includes('0')).toBe(true)
    expect(conditionalText.text().includes('0')).toBe(true)

    expect(wrapper.find('button').length).toBe(1)
    for (let i = 0; i < 2; ++i) {
      wrapper.find('button').simulate('click')
      wrapper.update()
    }

    setImmediate(() => {
      expect(normalText.text().includes('2')).toBe(true)
      expect(conditionalText.text().includes('2')).toBe(true)
      wrapper.unmount()
      done()
    })
  })

  it('updates when the bloc is changed at runtime to a different bloc and unsubscribes from old bloc', done => {
    let bloc: CounterBloc = new CounterBloc()
    const wrapper = mount(<CounterApp title={'dsad'} bloc={bloc} />)

    let normalText = wrapper.find('#normal-counter-tag')
    let conditionalText = wrapper.find('#counter-condition-tag')
    expect(normalText.text().includes('0')).toBe(true)
    expect(normalText.text().includes('0')).toBe(true)
    expect(conditionalText.text().includes('0')).toBe(true)
    expect(conditionalText.text().includes('0')).toBe(true)

    expect(wrapper.find('button').length).toBe(1)
    for (let i = 0; i < 2; ++i) {
      wrapper.find('button').simulate('click')
      wrapper.update()
    }

    let newBloc: CounterBloc = new CounterBloc()
    wrapper.setProps({ bloc: newBloc })
    wrapper.update()

    setImmediate(() => {
      expect(normalText.text().includes('0')).toBe(true)
      expect(conditionalText.text().includes('0')).toBe(true)
      wrapper.unmount()
      done()
    })
  })
})
