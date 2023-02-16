import { Observable } from "rxjs";
import { Bloc } from "../../../lib/src";
import { delay } from "../delay";
import { IntervalEvent, IntervalForEachEvent, IntervalNoEmitOnCloseEvent, IntervalOnEachEvent, IntervalOnEachEventWithoutOnError } from "./interval.event";
import { IntervalState, NoOnErrorState } from "./interval.state";

export class IntervalBloc extends Bloc<IntervalEvent, IntervalState> {
  constructor(stream$: Observable<number>) {
    super(new IntervalState(10)); 

    this.on(IntervalNoEmitOnCloseEvent, async (_event, emit) => {
      await emit.forEach(stream$, (data) => {
        return this.state.ready(data);
      });
      emit.close();
      await delay(1000);
      emit(this.state.loading()); // set loading to trigger completion
      await delay(1000)
      this.close()
    });

    this.on(IntervalForEachEvent, async (_event, emit) => {
      await emit.forEach(
        stream$,
        (data) => this.state.ready(data),
        (error) => this.state.failed(error)
      );
      
      emit(this.state.loading()); // set loading to trigger completion
    });

    this.on(IntervalOnEachEvent, async (_event, emit) => {
      await emit.onEach(
        stream$,
        (data) => {
          emit(this.state.ready(data));
        },
        (error) => {
          emit(this.state.failed(error));
        }
      );
      emit(this.state.loading()); // set loading to trigger completion
    });

    this.on(IntervalOnEachEventWithoutOnError, async (_event, emit) => {
      try {
        await emit.onEach(
          stream$,
          (data) => {
            emit(this.state.ready(data));
          }
        );
      } catch (e) {
        emit(new NoOnErrorState(this.state.data)); 
      }
      
    });
  }
}