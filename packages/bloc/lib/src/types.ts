import { Observable } from 'rxjs'
import { Emitter } from './emitter'
import { BlocEvent } from './event'

export type EventHandler<E extends BlocEvent, S> = (
  event: InstanceType<ClassType<E>>,
  emitter: Emitter<S>
) => void | Promise<void>

export interface ClassType<T> extends Function {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  new (...args: any[]): T
}

export type EventMapper<Event> = (event: Event) => Observable<void>

export type EventTransformer<Event> = (
  events$: Observable<Event>,
  mapper: EventMapper<Event>
) => Observable<void>
