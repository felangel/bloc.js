import { Bloc } from '@felangel/bloc'
import * as React from 'react'
import { Subscription } from 'rxjs'

export type BlocBuilderCondition<S> = (previous: S, current: S) => boolean
export type BlocElementBuilder<S> = (state: S) => JSX.Element

export type BlocBuilderProps<B extends Bloc<any, S>, S> = {
  bloc: B
  builder: BlocElementBuilder<S>
  condition?: BlocBuilderCondition<S>
}

export type BlocStateType<S> = {
  blocState: S
}

export class BlocBuilder<B extends Bloc<any, S>, S> extends React.Component<
  BlocBuilderProps<B, S>,
  BlocStateType<S>
> {
  private bloc: B
  private previousState: S
  private subscription: Subscription
  private condition: BlocBuilderCondition<S> | null
  private builder: BlocElementBuilder<S>

  constructor(props: BlocBuilderProps<B, S>) {
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

  componentDidUpdate(prevProps: BlocBuilderProps<B, S>) {
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
