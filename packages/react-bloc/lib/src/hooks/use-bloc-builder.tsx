import React from "react";
import { Subscription } from "rxjs";

interface BlocBuilderOptions {
  condition: (previous: any, current: any) => boolean;
}

export default function useBlocBuilder(
  bloc: any,
  options?: BlocBuilderOptions
) {
  const [state, setState] = React.useState(bloc.state);
  const mounted = React.useRef<any>(false);
  const previousState = React.useRef<any>(null);
  const subscription = React.useRef<any>(Subscription.EMPTY);
  const thisBloc = React.useRef<any>(bloc);

  const subscribe = () => {
    subscription.current = thisBloc.current.listen((s: any) => {
      let rebuild: boolean = options?.condition
        ? options.condition.call(null, previousState.current, state)
        : true;
      if (rebuild) setState(s);
      previousState.current = state;
    });
  };

  const unsubscribe = () => {
    subscription.current.unsubscribe();
  };

  React.useLayoutEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      subscribe();
    } else {
      unsubscribe();
      thisBloc.current = bloc;
      setState(bloc.state);
      subscribe();
    }
    return () => unsubscribe();
  });

  return { state };
}
