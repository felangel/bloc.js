import { BlocDelegate } from './bloc-delegate'

export class BlocSupervisor {
  private static _delegate: BlocDelegate = new BlocDelegate()

  static get delegate(): BlocDelegate {
    return this._delegate
  }

  static set delegate(value: BlocDelegate) {
    this._delegate = value
  }
}
