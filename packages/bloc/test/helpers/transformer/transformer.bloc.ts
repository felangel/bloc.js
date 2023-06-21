import { switchMap } from 'rxjs/operators'
import { Bloc, EventTransformer } from '../../../lib/src'
import { delay } from '../delay'
import { EventTransformerEvent, EventTransformerRestartableEvent } from './transformer.event'

export const restartable =
  <Event>(): EventTransformer<Event> =>
  (events$, mapper) =>
    events$.pipe(switchMap(mapper))

export class EventTransformerBloc extends Bloc<EventTransformerEvent, number> {
  constructor() {
    super(0)

    this.on(
      EventTransformerRestartableEvent,
      async (event, emit) => {
        await delay(500)
        emit(event.num)
      },
      restartable()
    )
  }
}
