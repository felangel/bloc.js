import { Observable, interval } from 'rxjs';
import { take } from 'rxjs/operators';
import { IntervalBloc, IntervalOnEachEvent, IntervalState, IntervalForEachEvent, IntervalNoEmitOnCloseEvent, IntervalOnEachEventWithoutOnError, NoOnErrorState } from './helpers/interval';

describe('emitter', () => {


  let interval$: Observable<number>;
  let intervalBloc: IntervalBloc;

  beforeEach(() => {
    interval$ = interval().pipe(take(3));
    intervalBloc = new IntervalBloc(interval$);
  });

  describe('emitter.onEach', () => {
    it('should emit values from a stream', (done) => {
      expect.assertions(1);
      const states: number[] = [];
      intervalBloc.state$.subscribe({
        next: (state) => {
          if (state.status === 'loading') return intervalBloc.close();
          states.push(state.data);
        },
        complete: () => {
          expect(states.length).toBe(3);
          done();
        },
      });

      intervalBloc.add(new IntervalOnEachEvent());
    });

    it('should invoke onError if an error is thrown from onEach stream', (done) => {
      expect.assertions(4);
      const states: IntervalState[] = [];
      const errorStream$ = new Observable<number>((subscriber) => {
        subscriber.next(1);

        setTimeout(() => {
          subscriber.error(new Error('stream error'));
        }, 0);
      });

      const bloc = new IntervalBloc(errorStream$);

      bloc.state$.subscribe({
        next: (state) => {
          if (state.status === 'loading') return bloc.close();
          states.push(state);
        },
        complete: () => {
          const [a, b] = states;
          expect(states.length).toBe(2);
          expect(a.data).toBe(1);
          expect(b.data).toBe(1);
          expect(b.error?.message).toBe('stream error');
          done();
        },
      });

      bloc.add(new IntervalOnEachEvent());
    });

    it('should throw an error if the input stream errors and no onError callback is provided', (done) => {
      expect.assertions(1);
      const states: IntervalState[] = [];
      const errorStream$ = new Observable<number>((subscriber) => {
        subscriber.next(1);

        setTimeout(() => {
          subscriber.error(new Error('stream error'));
        }, 0);
      });

      const bloc = new IntervalBloc(errorStream$);

        bloc.state$.subscribe({
          next: (state) => {
            if (state instanceof NoOnErrorState) return bloc.close();
            states.push(state);
          },
          complete: () => {
            expect(states.length).toBe(1)
            done()
          }
        })

        bloc.add(new IntervalOnEachEventWithoutOnError());
      })
    });

  describe('emitter.forEach', () => {
    it('should emit state returned from onData', (done) => {
      expect.assertions(1);
      const states: number[] = [];
      intervalBloc.state$.subscribe({
        next: (state) => {
          if (state.status === "loading") return intervalBloc.close();
          states.push(state.data);
        },
        complete: () => {
          expect(states.length).toBe(3);
          done()
        },
      });

      intervalBloc.add(new IntervalForEachEvent());
    });

    it('should not emit after an emitter has been closed', (done) => {
      expect.assertions(1);
      const states: number[] = [];
      intervalBloc.state$.subscribe({
        next: (state) => {
          states.push(state.data);
        },
        complete: () => {
          expect(states.length).toBe(3);
          done()
        },
      });

      intervalBloc.add(new IntervalNoEmitOnCloseEvent());
      
    });


    describe("onError", () => {
      const states: IntervalState[] = [];
      let errorStream$: Observable<number>
      let bloc: IntervalBloc

      beforeEach(() => {
        errorStream$ = new Observable<number>((subscriber) => {
          subscriber.next(1);
          setTimeout(() => {
            subscriber.error(new Error('stream error'));
          }, 0);
        });

        bloc = new IntervalBloc(errorStream$)
      })

      it('should resolve when onError is provided', (done) => {
        expect.assertions(4);

        bloc.state$.subscribe({
          next: (state) => {
            if (state.status === "loading") return bloc.close()
            states.push(state);
          },
          complete: () => {
            const [a, b] = states;
            expect(states.length).toBe(2);
            expect(a.data).toBe(1);
            expect(b.data).toBe(1);
            expect(b.error?.message).toBe('stream error');
            done();
          },
        });

        bloc.add(new IntervalForEachEvent());
      });
    })
  });
});
