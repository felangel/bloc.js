import { Observable, Subscriber } from 'rxjs'

/** Creates an Observable from async iterable, which can be produced by async generator  */
export function fromAsyncIterable<T>(iterable: AsyncIterable<T>) {
  return new Observable<T>(subscribeToAsyncIterable(iterable))
}

/**
 * Preserve async iterator method's symbol
 * https://github.com/ReactiveX/rxjs/blob/master/src/internal/observable/fromIterable.ts
 */
/** @private */
function getSymbolAsyncIterator(): symbol {
  if (typeof Symbol !== 'function' || !Symbol.asyncIterator) {
    return '@@asyncIterator' as any
  }
  return Symbol.asyncIterator
}
/** @private */
const asyncIterator = getSymbolAsyncIterator()

/**
 * Creates a subscriber's function for picking async iterable items
 * Written by combinig similar code for Promise and Iterable
 * https://github.com/ReactiveX/rxjs/blob/master/src/internal/util/subscribeToIterable.ts
 * https://github.com/ReactiveX/rxjs/blob/master/src/internal/util/subscribeToPromise.ts
 * Anyway, more tests are needed
 */
function subscribeToAsyncIterable<T>(iterable: AsyncIterable<T>) {
  return function(subscriber: Subscriber<T>) {
    //@ts-ignore
    const iterator = iterable[asyncIterator]() as AsyncIterator<T>
    function step() {
      iterator.next().then(
        item => {
          if (subscriber.closed) {
            return finalizeGenerator()
          }
          if (item.done) {
            subscriber.complete()
            return finalizeGenerator()
          }
          subscriber.next(item.value)
          step()
        },
        (err: any) => {
          subscriber.error(err)
          finalizeGenerator()
        }
      )
    }
    function finalizeGenerator() {
      if (typeof iterator.return === 'function') {
        subscriber.add(() => {
          if (iterator.return) {
            iterator.return()
          }
        })
      }
    }
    step()
    return subscriber
  }
}
