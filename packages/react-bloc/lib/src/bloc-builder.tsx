import { Bloc } from '@felangel/bloc'
import * as React from 'react'
import { Subscription } from 'rxjs'
import { BlocProvider } from '../react-bloc'

export type BlocBuilderCondition<S> = (previous: S, current: S) => boolean
export type BlocElementBuilder<S> = (state: S) => JSX.Element

export interface BlocBuilderPropsBase<S> {
  builder: BlocElementBuilder<S>
  condition?: BlocBuilderCondition<S>
}

type BlocBuilderPropsInternal<B extends Bloc<any, S>, S> = BlocBuilderPropsBase<S> & {
  bloc: B
}

export type BlocStateType<S> = {
  blocState: S
}

class BlocBuilderInternal<B extends Bloc<any, S>, S> extends React.Component<
  BlocBuilderPropsInternal<B, S>,
  BlocStateType<S>
> {
  private bloc: B
  private previousState: S
  private subscription: Subscription
  private condition: BlocBuilderCondition<S> | null
  private builder: BlocElementBuilder<S>

  constructor(props: BlocBuilderPropsInternal<B, S>) {
    super(props)
    this.bloc = props.bloc
    this.builder = props.builder
    this.condition = props.condition || null
    this.previousState = this.bloc.state
    this.subscription = Subscription.EMPTY
    this.state = {
      blocState: this.bloc.state
    }
  }

  private subscribe(): void {
    this.subscription = this.bloc.listen((state: S) => {
      let rebuild: boolean =
        this.condition !== null ? this.condition.call(this, this.previousState, state) : true

      if (rebuild) {
        this.setState({ blocState: state })
      }
      this.previousState = state
    })
  }

  private unsubscribe(): void {
    this.subscription.unsubscribe()
  }

  componentDidUpdate(prevProps: BlocBuilderPropsInternal<B, S>) {
    if (prevProps.bloc !== this.props.bloc) {
      this.unsubscribe()
      this.bloc = this.props.bloc
      this.previousState = this.bloc.state
      this.setState({ blocState: this.bloc.state })
      this.subscribe()
    }
  }

  componentDidMount() {
    this.subscribe()
  }

  componentWillUnmount() {
    this.unsubscribe()
  }

  render() {
    return this.builder(this.state.blocState)
  }
}

export type BlocBuilderProps<B extends Bloc<any, S>, S> = BlocBuilderPropsBase<S> & {
  type?: string
  bloc?: B
}

export function BlocBuilder<B extends Bloc<any, S>, S>(
  props: BlocBuilderProps<B, S>
): JSX.Element {
  if (props.bloc) {
    return (
      <BlocBuilderInternal bloc={props.bloc} builder={props.builder} condition={props.condition} />
    )
  } else if (props.type) {
    const context = BlocProvider.context<B>(props.type)
    return (
      <context.Consumer>
        {bloc => (
          <BlocBuilderInternal bloc={bloc} builder={props.builder} condition={props.condition} />
        )}
      </context.Consumer>
    )
  }
  throw Error('BlocBuilder: Expected either "bloc" or "type" property to be not null.')
}
