import { Bloc, BlocObserver, Transition } from '@felangel/bloc';

enum CounterEvent {
  increment = 'INCREMENT',
  decrement = 'DECREMENT'
}

class MyBlocObserver extends BlocObserver {
  onEvent(_: Bloc<any, any>, event: CounterEvent) {
    console.log(`added ${event}`);
  }

  onTransition(_: Bloc<any, any>, transition: Transition<any, any>) {
    console.log(transition);
  }

  onError(_: Bloc<any, any>, error: any) {
    console.log(`error: ${error}`);
  }
}

class CounterBloc extends Bloc<CounterEvent, number> {
  constructor() {
    super(0);
  }

  async *mapEventToState(event: CounterEvent) {
    switch (event) {
      case CounterEvent.increment:
        await wait(1000); // Simulating Latency
        yield this.state + 1;
        break;
      case CounterEvent.decrement:
        await wait(500); // Simulating Latency
        yield this.state - 1;
        break;
    }
  }
}

(async function main() {
  Bloc.observer = new MyBlocObserver();
  const counterBloc = new CounterBloc();

  counterBloc.add(CounterEvent.increment);
  counterBloc.add(CounterEvent.increment);
  counterBloc.add(CounterEvent.increment);

  counterBloc.add(CounterEvent.decrement);
  counterBloc.add(CounterEvent.decrement);
  counterBloc.add(CounterEvent.decrement);
})();

async function wait(ms: number): Promise<void> {
  return new Promise<void>((resolve, _) => {
    setTimeout(() => {
      resolve();
    }, ms);
  });
}
