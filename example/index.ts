import { Bloc, BlocSupervisor, BlocDelegate, Transition } from 'bloc';

enum CounterEvent {
    increment = 'INCREMENT',
    decrement = 'DECREMENT',
    doNothing = 'DO_NOTHING'
}

class MyBlocDelegate extends BlocDelegate {
    onEvent(_: Bloc<any, any>, event: CounterEvent) {
        console.log(event);
    }

    onTransition(_: Bloc<any, any>, transition: Transition<any, any>) {
        console.log(transition);
    }

    onError(_: Bloc<any, any>, error: any) {
        console.log(error);
    }
}

class CounterBloc extends Bloc<CounterEvent, number> {
    initialState(): number {
        return 0;
    }

    async *mapEventToState(event: CounterEvent) {
        switch (event) {
            case CounterEvent.increment:
                await wait(1000); // Simulating Latency
                yield this.currentState + 1;
                break;
            case CounterEvent.decrement:
                await wait(500); // Simulating Latency
                yield this.currentState - 1;
                break;
            case CounterEvent.doNothing:
                yield this.currentState;
                break;
            default:
                throw 'unsupported event';
        }
    }
}

(async function main() {
    BlocSupervisor.delegate = new MyBlocDelegate();
    const counterBloc = new CounterBloc();

    counterBloc.dispatch(CounterEvent.increment);
    counterBloc.dispatch(CounterEvent.increment);
    counterBloc.dispatch(CounterEvent.increment);

    counterBloc.dispatch(CounterEvent.decrement);
    counterBloc.dispatch(CounterEvent.decrement);
    counterBloc.dispatch(CounterEvent.decrement);

    counterBloc.dispatch(null);
    counterBloc.dispatch(undefined);

    counterBloc.dispatch(CounterEvent.increment);
    counterBloc.dispatch(CounterEvent.decrement);

    counterBloc.dispatch(CounterEvent.doNothing);
    counterBloc.dispatch(CounterEvent.doNothing);
    counterBloc.dispatch(CounterEvent.doNothing);
})();

async function wait(ms: number): Promise<void> {
    return new Promise<void>((resolve, _) => {
        setTimeout(() => {
            resolve();
        }, ms);
    });
}
