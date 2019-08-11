import { Bloc, Transition } from 'bloc';

enum CounterEvent {
    increment = 'INCREMENT',
    decrement = 'DECREMENT',
    doNothing = 'DO_NOTHING',
    doUndefined = 'DO_UNDEFINED',
    doNull = 'DO_NULL'
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
            case CounterEvent.doUndefined:
                yield undefined;
                break;
            case CounterEvent.doNull:
                yield null;
                break;
            default:
                throw 'unsupported event';
        }
    }

    onEvent(event: CounterEvent) {
        console.log(`onEvent ${event}`);
    }

    onTransition(transition: Transition<CounterEvent, number>) {
        console.log(transition);
    }

    onError(error: any) {
        console.log(`onError ${error}`);
    }
}

(async function main() {
    const counterBloc = new CounterBloc();

    counterBloc.dispatch(CounterEvent.increment);
    counterBloc.dispatch(CounterEvent.increment);
    counterBloc.dispatch(CounterEvent.increment);

    counterBloc.dispatch(CounterEvent.decrement);
    counterBloc.dispatch(CounterEvent.decrement);
    counterBloc.dispatch(CounterEvent.decrement);

    counterBloc.dispatch(undefined);

    counterBloc.dispatch(CounterEvent.increment);
    counterBloc.dispatch(CounterEvent.decrement);

    counterBloc.dispatch(CounterEvent.doNothing);
    counterBloc.dispatch(CounterEvent.doNothing);
    counterBloc.dispatch(CounterEvent.doNothing);

    counterBloc.dispatch(CounterEvent.doUndefined);
    counterBloc.dispatch(CounterEvent.doNull);
})();

async function wait(ms: number): Promise<void> {
    return new Promise<void>((resolve, _) => {
        setTimeout(() => {
            resolve();
        }, ms);
    });
}
