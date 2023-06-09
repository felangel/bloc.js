import { Bloc } from '@felangel/bloc'
import * as React from 'react'

export type BlocCreator<B extends Bloc<any, any>> = () => B

export interface BlocProviderProps<B extends Bloc<any, any>> {
  bloc?: B
  create?: BlocCreator<B>
  type: string
}

interface BlocProviderState<B extends Bloc<any, any>> {
  bloc: B | null
  blocContext: React.Context<B | null>
  shouldDestroy: boolean
}

/**
 * `BlocProvider` provides bloc of a certain 'type' to all descendants
 * @export
 * @function BlocProvider
 * @param {BlocProviderProps<B>} props
 * @template B
 * @returns {JSX.Element}
 */
export function BlocProvider<B extends Bloc<any, any>>(
  props: React.PropsWithChildren<BlocProviderProps<B>>
): JSX.Element {
  const [state, setState] = React.useState<BlocProviderState<B> | null>(null)

  React.useEffect(() => {
    setState(BlocProvider.getStateFromProps(props))
    return () => {
      if (state && state.bloc && state.shouldDestroy) {
        // close only if BlocProvider was the creator
        state.bloc.close()
      }
    }
  }, [props.bloc, props.type, props.create])

  if (state) {
    return (
      <state.blocContext.Provider value={state.bloc}>{props.children}</state.blocContext.Provider>
    )
  }
  return <React.Fragment></React.Fragment>
}

BlocProvider.contextTypeMap = {} as Record<string, React.Context<unknown> | null>

BlocProvider.clear = function(): void {
  BlocProvider.contextTypeMap = {}
}

BlocProvider.context = function<B>(type: string): React.Context<B> {
  const context = BlocProvider.contextTypeMap[type]
  if (context) {
    return context as React.Context<B>
  }

  throw Error('BlocProvider: BlocContext of type ' + type + ' not found!')
}

BlocProvider.getStateFromProps = function<B extends Bloc<any, any>>(
  props: BlocProviderProps<B>
): BlocProviderState<B> {
  let bloc: B | null = null
  let shouldDestroy = false

  if (props.bloc) {
    bloc = props.bloc
  } else if (props.create) {
    bloc = props.create()
    shouldDestroy = true
  } else {
    throw Error('BlocProvider: Expected either "bloc" or "create" property to be not null.')
  }

  let blocContext = BlocProvider.contextTypeMap[props.type] as React.Context<B | null>
  if (!blocContext) {
    blocContext = React.createContext<B | null>(bloc)
    blocContext.displayName = props.type
    BlocProvider.contextTypeMap[props.type] = blocContext as React.Context<unknown>
  }
  return { bloc, blocContext, shouldDestroy }
}
