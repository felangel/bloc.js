/* eslint-disable @typescript-eslint/no-explicit-any */

import { Bloc, BlocBase, Transition } from ".";
import { Change } from './';

export class BlocObserver {
  onCreate(_bloc: BlocBase<any>): void {
    return;
  }

  onEvent(_bloc: Bloc<any, any>, _event: any): void {
    return;
  }

  onTransition(_bloc: Bloc<any, any>, _transition: Transition<any, any>): void {
    return;
  }

  onError(_bloc: BlocBase<any>, _error: Error): void {
    return;
  }

  onChange(_bloc: BlocBase<any>, _change: Change<any>) {
    return;
  }

  onClose(_bloc: BlocBase<any>): void {
    return;
  }
}
