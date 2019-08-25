import { Bloc } from '@felangel/bloc'
import * as React from 'react'
import { Subscription } from 'rxjs'
import { skip } from 'rxjs/operators'

type BlocBuilderCondition<S> = (previous: S, current: S) => boolean
type BlocElementBuilder<S> = (state: S) => JSX.Element

type BlocBuilderProps<B extends Bloc<any, S>, S> = {
  bloc: B
  builder: BlocElementBuilder<S>
  condition?: BlocBuilderCondition<S>
}

type BlocStateType<S> = {
  blocState: S
}

export class BlocBuilder<B extends Bloc<any, S>, S> extends React.Component<
  BlocBuilderProps<B, S>,
  BlocStateType<S>
> {
  private bloc: B
  private previousState: S
  private subscription: Subscription | null
  private condition: BlocBuilderCondition<S> | null
  private builder: BlocElementBuilder<S>

  constructor(props: BlocBuilderProps<B, S>) {
    super(props)
    this.bloc = props.bloc
    this.builder = props.builder
    this.condition = props.condition || null
    this.previousState = this.bloc.currentState
    this.subscription = null
    this.state = {
      blocState: this.bloc.currentState
    }
    this.subscribe()
  }

  private subscribe(): void {
    this.subscription = this.bloc.state.pipe(skip(1)).subscribe((state: S) => {
      let rebuild: boolean =
        this.condition !== null ? this.condition.call(this, this.previousState, state) : true

      if (rebuild) {
        this.setState({ blocState: state })
      }
      this.previousState = state
    })
  }

  private unsubscribe(): void {
    if (this.subscription !== null) {
      this.subscription.unsubscribe()
      this.subscription = null
    }
  }

  componentDidUpdate(prevProps: BlocBuilderProps<B, S>) {
    if (prevProps.bloc !== this.props.bloc) {
      if (this.subscription !== null) {
        this.unsubscribe()
        this.bloc = this.props.bloc
        this.previousState = this.bloc.currentState
        this.setState({ blocState: this.bloc.currentState })
      }
      this.subscribe()
    }
  }

  componentWillUnmount() {
    this.unsubscribe()
  }

  render() {
    return this.builder(this.state.blocState)
  }
}
