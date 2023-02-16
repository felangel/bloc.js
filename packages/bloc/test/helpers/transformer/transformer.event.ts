import { BlocEvent } from "../../../lib/src";

export abstract class EventTransformerEvent extends BlocEvent { }

export class EventTransformerRestartableEvent extends EventTransformerEvent { 
  constructor(public num = 1) {
    super()
  }
}
