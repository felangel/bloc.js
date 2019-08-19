import { Bloc } from './bloc'
import { Transition } from './transition'

export class BlocDelegate {
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
