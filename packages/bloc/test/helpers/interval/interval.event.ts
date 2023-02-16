import { BlocEvent } from "../../../lib/src";

export abstract class IntervalEvent extends BlocEvent { }
export class IntervalOnEachEvent extends IntervalEvent { }
export class IntervalOnEachEventWithoutOnError extends IntervalEvent { }
export class IntervalForEachEvent extends IntervalEvent { }
export class IntervalNoEmitOnCloseEvent extends IntervalEvent { }