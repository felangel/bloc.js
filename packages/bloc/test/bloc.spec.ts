import { take } from 'rxjs/operators'
import { BlocEvent, Bloc, Transition, isBlocInstance } from '../lib/src'
import { CounterBloc } from './helpers/counter/counter.bloc'
import { CounterCubit } from './helpers/counter/counter.cubit'
import {
  CounterIncrementEvent,
  CounterDecrementEvent,
  CounterNoRegistrationEvent,
} from './helpers/counter/counter.event'
import { SeededCounterBloc, SeedEvent } from './helpers/counter/counter.seeded.bloc'
import { CounterState } from './helpers/counter/counter.state'
import { delay } from './helpers/delay'
import { EventTransformerBloc } from './helpers/transformer/transformer.bloc'
import { EventTransformerRestartableEvent } from './helpers/transformer/transformer.event'

describe('bloc', () => {
  let bloc: CounterBloc

  beforeEach(() => {
    bloc = new CounterBloc()
  })

  it('should be defined', () => {
    expect.assertions(1)
    expect(bloc).toBeDefined()
  })

  it('should throw an error if trying to add an event that is not registered', () => {
    expect.assertions(1)
    expect(() => {
      bloc.add(new CounterNoRegistrationEvent())
    }).toThrow()
  })

  it('should map events to state', (done) => {
    expect.assertions(4)
    const states: CounterState[] = []
    bloc.state$.pipe(take(4)).subscribe({
      next: (state) => states.push(state),
      complete: () => {
        const [first, second, third, fourth] = states
        expect(first.data).toBe(1)
        expect(second.data).toBe(2)
        expect(third.data).toBe(3)
        expect(fourth.data).toBe(2)
        bloc.close()
        done()
      },
    })
    bloc.add(new CounterIncrementEvent())
    bloc.add(new CounterIncrementEvent())
    bloc.add(new CounterIncrementEvent())
    bloc.add(new CounterDecrementEvent())
  })

  describe('Bloc.on', () => {
    it('should work without optional config', () => {
      expect.assertions(1)
      type TestStatus = 'initial' | 'loading' | 'ready' | 'failed'

      class TestState {
        constructor(public data: null, public status: TestStatus = 'initial') {}

        ready(data?: null) {
          return new TestState(data ?? this.data, 'ready')
        }

        loading() {
          return new TestState(this.data, 'loading')
        }

        failed() {
          return new TestState(this.data, 'failed')
        }
      }

      class TestEvent extends BlocEvent {}

      class TestBloc extends Bloc<TestEvent, TestState> {
        constructor() {
          super(new TestState(null))

          this.on(TestEvent, (_event, emit) => {
            emit(this.state.ready())
          })
        }
      }

      let testState: TestState
      const testBloc = new TestBloc()
      testBloc.state$.pipe(take(1)).subscribe({
        next: (state) => (testState = state),
        complete: () => {
          expect(testState).toBeDefined()
          testBloc.close()
        },
      })
      testBloc.add(new TestEvent())
    })

    it('should throw an error if attempting to subscribe to the same event more than once', () => {
      expect.assertions(1)
      class TestEvent extends BlocEvent {}

      class TestBloc extends Bloc<TestEvent, null> {
        constructor() {
          super(null)

          this.on(TestEvent, (_event, _emit) => {
            return
          })

          this.on(TestEvent, (_event, _emit) => {
            return
          })
        }
      }

      expect(() => new TestBloc()).toThrowError('TestEvent can only have one EventHandler')
    })

    it('should use optional event transformer', async () => {
      expect.assertions(3)
      const transformerBloc = new EventTransformerBloc()
      const states: number[] = []
      transformerBloc.state$.subscribe({
        next: (state) => states.push(state),
      })

      expect(states.length).toBe(0)
      transformerBloc.add(new EventTransformerRestartableEvent())
      transformerBloc.add(new EventTransformerRestartableEvent())
      transformerBloc.add(new EventTransformerRestartableEvent())
      transformerBloc.add(new EventTransformerRestartableEvent())
      transformerBloc.add(new EventTransformerRestartableEvent(2))
      await delay(600)
      const [first] = states
      expect(states.length).toBe(1)
      expect(first).toBe(2)
    })

    it('should emit initial state only once', () => {
      let errors: Error[] = []

      let states: CounterState[] = []

      class EmitTestBloc extends SeededCounterBloc {
        protected override onError(error: Error): void {
          errors.push(error)
          super.onError(error)
        }
      }

      const emitBloc = new EmitTestBloc()
      emitBloc.state$.subscribe(states.push.bind(states))

      emitBloc.add(new SeedEvent())
      emitBloc.add(new SeedEvent())

      const [a] = states
      expect(states.length).toBe(1)
      expect(a.data).toBe(0)

      // close
      errors = []
      states = []
      emitBloc.close()
    })
  })

  describe('Bloc.onError', () => {
    it('should be invoked when an error is thrown from Bloc.onEvent', (done) => {
      expect.assertions(1)
      class TestEvent extends BlocEvent {}

      class TestBloc extends Bloc<TestEvent, null> {
        constructor() {
          super(null)
          this.on(TestEvent, (_event, _emit) => {
            return
          })
        }

        protected override onEvent(_event: TestEvent): void {
          throw new Error('onevent error')
        }

        protected override onError(error: Error): void {
          expect(error.message).toBe('onevent error')
        }
      }

      const testBloc = new TestBloc()
      testBloc.state$.subscribe({ complete: () => done() })
      testBloc.add(new TestEvent())
      testBloc.close()
    })

    it('should be invoked when an error is thrown inside an event callback', (done) => {
      expect.assertions(1)
      class TestEvent extends BlocEvent {}

      class TestBloc extends Bloc<TestEvent, null> {
        constructor() {
          super(null)
          this.on(TestEvent, (_event, _emit) => {
            throw new Error('eventcallback error')
          })
        }

        protected override onError(error: Error): void {
          expect(error.message).toBe('eventcallback error')
          bloc.close()
          done()
        }
      }

      const testBloc = new TestBloc()
      testBloc.add(new TestEvent())
    })

    it('should be invoked when an error is thrown from onTransition', (done) => {
      expect.assertions(1)
      type TestStatus = 'initial' | 'loading' | 'ready' | 'failed'

      class TestState {
        constructor(public data: null, public status: TestStatus = 'initial') {}

        ready(data?: null) {
          return new TestState(data ?? this.data, 'ready')
        }

        loading() {
          return new TestState(this.data, 'loading')
        }

        failed() {
          return new TestState(this.data, 'failed')
        }
      }

      class TestEvent extends BlocEvent {}

      class TestBloc extends Bloc<TestEvent, TestState> {
        constructor() {
          super(new TestState(null))
          this.on(TestEvent, (_event, emit) => {
            emit(this.state.loading())
          })
        }

        protected override onTransition(_transition: Transition<TestEvent, TestState>): void {
          throw new Error('ontransition error')
        }

        protected override onError(error: Error): void {
          expect(error.message).toBe('ontransition error')
          bloc.close()
          done()
        }
      }

      const testBloc = new TestBloc()
      testBloc.add(new TestEvent())
    })
  })

  describe('isBlocInstance', () => {
    it('should return true if provided an instance of a bloc', () => {
      expect.assertions(2)
      expect(isBlocInstance(bloc)).toBe(true)
      const cubit = new CounterCubit()
      expect(isBlocInstance(cubit)).toBe(false)
    })
  })
})
