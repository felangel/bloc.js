import { Bloc, Transition } from '../bloc'

export class BlocObserver {
  onEvent(_bloc: Bloc<any, any>, _event: any) {
    return
  }

  onTransition(_bloc: Bloc<any, any>, _transition: Transition<any, any>) {
    return
  }

  onError(_bloc: Bloc<any, any>, _error: any) {
    return
  }
}
