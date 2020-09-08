import React from 'react';
import ReactDOM from 'react-dom';
import { Bloc } from '@felangel/bloc';
import { BlocBuilder } from '@felangel/react-bloc';
import './index.css';

enum CounterEvent {
  increment = 'INCREMENT',
  decrement = 'DECREMENT'
}

class CounterBloc extends Bloc<CounterEvent, number> {
  constructor() {
    super(0);
  }

  async *mapEventToState(event: CounterEvent) {
    switch (event) {
      case CounterEvent.increment:
        yield this.state + 1;
        break;
      case CounterEvent.decrement:
        yield this.state - 1;
        break;
    }
  }
}

const App: React.FC = () => {
  let bloc = new CounterBloc();
  return (
    <div className="App">
      <p>Counter</p>
      <BlocBuilder
        bloc={bloc}
        builder={(count: number) => {
          return <p>{count}</p>;
        }}
      />
      <button onClick={() => bloc.add(CounterEvent.increment)}>Increase Counter</button>
      <button onClick={() => bloc.add(CounterEvent.decrement)}>Decrement Counter</button>
    </div>
  );
};

ReactDOM.render(<App />, document.getElementById('root'));
