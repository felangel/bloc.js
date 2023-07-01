import { Cubit } from "../lib/bloc";

class CounterCubit extends Cubit<number> {
    constructor() {
        super(0);
    }

    async increment() {
        this.emit(this.state + 1);
    }

    async decrement() {
        this.emit(this.state - 1);
    }
}

async function wait(ms: number): Promise<void> {
    return new Promise<void>((resolve, _) => {
        setTimeout(() => {
            resolve();
        }, ms);
    });
}

const counterCubit = new CounterCubit();

counterCubit.listen(console.log);

counterCubit.increment();
counterCubit.decrement();