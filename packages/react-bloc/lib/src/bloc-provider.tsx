import { Bloc } from '@felangel/bloc'
import * as React from 'react'

export type BlocCreator<B extends Bloc<any, any>> = () => B

export interface BlocProviderProps<B extends Bloc<any, any>> {
  bloc?: B
  create?: BlocCreator<B>
  type: string
}

export interface BlocProviderState<B extends Bloc<any, any>> {
  bloc: B | null
  blocContext: React.Context<B | null>
}

export class BlocProvider<B extends Bloc<any, any>> extends React.Component<
  React.PropsWithChildren<BlocProviderProps<B>>,
  BlocProviderState<B>
> {
  //   private blocContext: React.Context<B | null>
  //   private bloc: B | null = null

  constructor(props: BlocProviderProps<B>) {
    super(props)

    this.state = this.getStateFromProps()
  }

  private getStateFromProps(): BlocProviderState<B> {
    let bloc: B | null = null

    if (this.props.bloc) {
      bloc = this.props.bloc
    } else if (this.props.create) {
      bloc = this.props.create()
    } else {
      throw Error('BlocProvider: Expected either "bloc" or "create" property to be not null.')
    }

    let blocContext = BlocProvider.contextTypeMap[this.props.type] as React.Context<B | null>
    if (!blocContext) {
      blocContext = React.createContext<B | null>(bloc)
      blocContext.displayName = this.props.type
      BlocProvider.contextTypeMap[this.props.type] = blocContext as React.Context<unknown>
    }
    return { bloc, blocContext }
  }

  private subscribe(): void {
    const state = this.getStateFromProps()
    this.setState(state)
  }

  private unsubscribe(): void {
    if (!this.props.bloc && this.state.bloc) {
      // dispose only if BlocProvider was the creator
      this.state.bloc.dispose()
    }
  }

  componentDidUpdate(prevProps: BlocProviderProps<B>) {
    if (
      prevProps.bloc !== this.props.bloc ||
      prevProps.type !== this.props.type ||
      prevProps.create !== this.props.create
    ) {
      this.unsubscribe()
      this.subscribe()
    }
  }

  componentWillUnmount() {
    this.unsubscribe()
  }

  render() {
    return (
      <this.state.blocContext.Provider value={this.state.bloc}>
        {this.props.children}
      </this.state.blocContext.Provider>
    )
  }

  static clear(): void {
    BlocProvider.contextTypeMap = {}
  }

  static context<B>(type: string): React.Context<B> {
    const context = BlocProvider.contextTypeMap[type]
    if (context) {
      return context as React.Context<B>
    }

    throw Error('BlocProvider: BlocContext of type ' + type + ' not found!')
  }

  private static contextTypeMap = {} as Record<string, React.Context<unknown> | null>
}
