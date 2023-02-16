import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Cubit, Change } from '../lib/bloc';
import { StateError } from '../lib/src/errors';
import { CounterCubit } from './helpers/counter/counter.cubit';
import { SeededCounterCubit } from './helpers/counter/counter.seeded.cubit';

describe('Cubit', () => {
  let cubit: CounterCubit;
  let state$: Observable<number>;

  beforeEach(() => {
    cubit = new CounterCubit();
    state$ = cubit.state$;
  });

  it('should create a new Cubit instance', () => {
    expect.assertions(1);
    expect(cubit).toBeInstanceOf(Cubit);
  });

  it('should close a cubit', async () => {
    expect.assertions(2);
    expect(cubit.isClosed).toBe(false);
    cubit.close();
    await expect(cubit.isClosed).toBe(true);
  });

  it('should return new state from actions', (done) => {
    expect.assertions(3);
    const states: number[] = [];
    state$.pipe(tap((state) => states.push(state))).subscribe({
      complete: () => {
        const [first, second] = states;
        expect(states.length).toBe(2);
        expect(first).toBe(1);
        expect(second).toBe(2);
        done();
      },
    });
    cubit.increment();
    cubit.increment();
    cubit.close();
  });

  it('should handle async actions', (done) => {
    expect.assertions(4);
    void (async () => {
      const states: number[] = [];
      state$.pipe(tap((state) => states.push(state))).subscribe({
        complete: () => {
          const [first, second, third] = states;
          expect(states.length).toBe(3);
          expect(first).toBe(1);
          expect(second).toBe(0);
          expect(third).toBe(1);
          done();
        },
      });
      await cubit.asyncIncrement();
      cubit.close();
    })();
  });

  describe('Cubit.onError', () => {
    let errors: Error[] = [];

    class OnChangeError extends Error {
      override message = 'onchange error';
    }

    class ErrorTestBloc extends Cubit<number> {
      constructor() {
        super(0);
      }

      triggerChange() {
        this.emit(1);
      }

      protected override onChange(_change: Change<number>): void {
        throw new OnChangeError();
      }

      protected override onError(error: Error): void {
        errors.push(error);
        super.onError(error);
      }
    }

    let errorBloc: ErrorTestBloc;

    beforeEach(() => {
      errorBloc = new ErrorTestBloc();
      errors = [];
    });

    afterEach(() => {
      errorBloc.close();
    });

    it('should be invoked when an error is thrown from BlocBase.onChange', () => {
      expect.assertions(1);
      try {
        errorBloc.triggerChange();
      } catch (e) {
        console.error(e);
      }


      const [a] = errors;

      expect(a.message).toBe('onchange error');
    });
  })

  describe("Cubit.emit", () => {
    let errors: Error[] = [];

    let states: number[] = [];

    class EmitTestBloc extends SeededCounterCubit {
      
      protected override onError(error: Error): void {
        errors.push(error);
        super.onError(error);
      }

    }

    let emitBloc: EmitTestBloc;

    beforeEach(() => {
      emitBloc = new EmitTestBloc();
      emitBloc.state$.subscribe(states.push.bind(states));
    });

    afterEach(() => {
      errors = [];
      states = []
      emitBloc.close();
    });


    it("should throw a StateError when the Cubit is closed", () => {
      expect.assertions(5);

      emitBloc.increment()
      emitBloc.increment()

      emitBloc.close();

      emitBloc.increment()

      const [a, b] = states;
      const [error] = errors

      expect(states.length).toBe(2);
      expect(errors.length).toBe(1)
      expect(error).toBeInstanceOf(StateError)
      expect(a).toBe(1);
      expect(b).toBe(2);
    });

    it ("should emit states in the correct order", () => {
      expect.assertions(2)
      emitBloc.increment()
      const [a] = states
      expect(states.length).toBe(1)
      expect(a).toBe(1)
    })

    it ("should emit initial state only once", () => {
      expect.assertions(2)
      emitBloc.seed()
      emitBloc.seed()
      const [a] = states
      expect(states.length).toBe(1)
      expect(a).toBe(0)
    })
  });
})