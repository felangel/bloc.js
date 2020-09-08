import { BlocProvider, BlocBuilder, BlocConsumer } from '../lib/react-bloc'
import * as React from 'react'
import { Bloc } from '@felangel/bloc'
import { mount } from 'enzyme'
import 'jsdom-global/register'

enum CounterEvent {
  increment,
  decrement
}
class CounterBloc extends Bloc<CounterEvent, number> {
  initialState(): number {
    return 0
  }

  async *mapEventToState(event: CounterEvent): AsyncIterableIterator<number> {
    switch (event) {
      case CounterEvent.increment:
        yield this.state + 1
        break
      case CounterEvent.decrement:
        yield this.state - 1
        break
    }
  }
}

type CounterAppProps = {
  title: string
}

class CounterComponent extends React.Component<{}, any> {
  render() {
    return (
      <React.Fragment>
        <BlocBuilder<CounterBloc, number>
          type="CounterBloc"
          builder={count => {
            return <p id="counter-with-type-lookup">{count}</p>
          }}
        />
        <BlocConsumer
          type="CounterBloc"
          consumer={bloc => (
            <React.Fragment>
              <BlocBuilder<CounterBloc, number>
                bloc={bloc}
                builder={count => {
                  return <p id="counter-without-type-lookup">{count}</p>
                }}
              />
              <button
                id="counter-increment"
                onClick={() => {
                  bloc.add(CounterEvent.increment)
                }}
              ></button>
            </React.Fragment>
          )}
        />
      </React.Fragment>
    )
  }
}

const CounterApp: React.FunctionComponent<CounterAppProps> = (
  props: CounterAppProps
): JSX.Element => {
  const [type, setType] = React.useState('CounterBloc')
  const [bloc, setBloc] = React.useState<CounterBloc | undefined>(undefined)
  const create = bloc ? undefined : () => new CounterBloc()
  return (
    <div id="CounterExample">
      <h1>{props.title}</h1>
      <BlocProvider type={type} create={create} bloc={bloc}>
        <CounterComponent />
      </BlocProvider>
      <button id="change-type" onClick={() => setType('CounterBloc2')}>
        Change Type
      </button>
      <button id="change-bloc" onClick={() => setBloc(new CounterBloc())}>
        Change Bloc
      </button>
    </div>
  )
}

describe('BlocProvider', () => {
  beforeEach(() => {
    BlocProvider.clear()
  })

  it('renders the class component properly', () => {
    const wrapper = mount(<CounterApp title={'dsad'} />)
    expect(wrapper.find('CounterApp').length).toBe(1)
    expect(wrapper.find('div').length).toBe(1)
    expect(wrapper.find('button#counter-increment').length).toBe(1)
    expect(wrapper.find('button#change-type').length).toBe(1)
    expect(wrapper.find('button#change-bloc').length).toBe(1)
    expect(wrapper.find('BlocProvider').length).toBe(1)
    expect(wrapper.find('CounterComponent').length).toBe(1)
    expect(wrapper.find('BlocBuilder').length).toBe(2)
    expect(wrapper.find('p').length).toBe(2)
  })

  it('throws input error when blocprovider not provided create or bloc', () => {
    const t = () => {
      const wrapper = mount(
        <div>
          <BlocProvider<CounterBloc> type="CounterBloc"></BlocProvider>
        </div>
      )
    }
    try {
      t()
    } catch (error) {
      expect(error).toBeInstanceOf(Error)
      expect(error).toHaveProperty(
        'message',
        'BlocProvider: Expected either "bloc" or "create" property to be not null.'
      )
    }
  })

  it('throws context error when blocconsumer uses a type not provided in parent', () => {
    const t = () => {
      const wrapper = mount(
        <div>
          <BlocConsumer
            type="CounterBloc"
            consumer={bloc => (
              <BlocBuilder<CounterBloc, number>
                bloc={bloc}
                builder={(s: number) => <div>{s}</div>}
              />
            )}
          />
        </div>
      )
    }
    try {
      t()
    } catch (error) {
      expect(error).toBeInstanceOf(Error)
      expect(error).toHaveProperty(
        'message',
        'BlocProvider: BlocContext of type CounterBloc not found!'
      )
    }
  })

  it('receives events and sends state updates to the component', done => {
    const wrapper = mount(<CounterApp title={'dsad'} />)

    let text1 = wrapper.find('#counter-without-type-lookup')
    let text2 = wrapper.find('#counter-with-type-lookup')
    expect(text1.text().includes('0')).toBe(true)
    expect(text2.text().includes('0')).toBe(true)

    let incrementButton = wrapper.find('button#counter-increment')
    expect(incrementButton.length).toBe(1)
    for (let i = 0; i < 5; ++i) {
      incrementButton.simulate('click')
      wrapper.update()
    }

    setImmediate(() => {
      expect(text1.text().includes('5')).toBe(true)
      expect(text2.text().includes('5')).toBe(true)
      wrapper.unmount()
      done()
    })
  })

  it('updates when bloc is changed at runtime to a different bloc', done => {
    const wrapper = mount(<CounterApp title={'dsad'} />)

    let text1 = wrapper.find('#counter-without-type-lookup')
    let text2 = wrapper.find('#counter-with-type-lookup')
    expect(text1.text().includes('0')).toBe(true)
    expect(text2.text().includes('0')).toBe(true)

    let incrementButton = wrapper.find('button#counter-increment')
    expect(incrementButton.length).toBe(1)
    for (let i = 0; i < 5; ++i) {
      incrementButton.simulate('click')
      wrapper.update()
    }

    let changeBlocButton = wrapper.find('button#change-bloc')
    expect(changeBlocButton.length).toBe(1)
    changeBlocButton.simulate('click')

    setImmediate(() => {
      expect(text1.text().includes('0')).toBe(true)
      expect(text2.text().includes('0')).toBe(true)
      wrapper.unmount()
      done()
    })
  })
})
