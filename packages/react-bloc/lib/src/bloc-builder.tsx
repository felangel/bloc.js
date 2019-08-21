import { Bloc } from '@felangel/bloc';
import * as React from 'react';
import { Subscription } from 'rxjs';
import { skip } from 'rxjs/operators';

type BlocBuilderCondition<S> = (previous: S, current: S) => boolean;
type BlocElementBuilder<S> = (state: S) => JSX.Element;

type BlocBuilderProps<B extends Bloc<any, S>, S> = {
    bloc: B;
    builder: BlocElementBuilder<S>;
    condition?: BlocBuilderCondition<S>;
}

export class BlocBuilder<B extends Bloc<any, S>, S>  extends React.Component<BlocBuilderProps<B, S>, any> {
    private bloc: B;
    private previousState: S;
    private subscription: Subscription;
    private blocState: S;
    private condition: BlocBuilderCondition<S> | null;
    private builder: BlocElementBuilder<S>;


    constructor(props : BlocBuilderProps<B,S>) {
        super(props);
        this.bloc = props.bloc;
        this.builder = props.builder;
        this.condition = props.condition || null;
        this.previousState = this.bloc.currentState;
        this.blocState = this.bloc.currentState;
        this.subscription = Subscription.EMPTY;
        this.state = {
            blocState: this.blocState,
        }
        this.subscribe();
    }

    private subscribe(): void {
        if(this.bloc.state !== null) {
            this.subscription = this.bloc.state.pipe(skip(1)).subscribe((state: S | null) => {
                let condition : boolean;
                if(state === null) {
                    return;
                }
                if(this.condition !== null) {
                    condition = this.condition.call(this, this.previousState, state);
                } else {
                    condition = true;
                }

                if(condition) {
                    console.log(state);
                    this.setState({blocState: state});
                    this.blocState = state;
                }
                this.previousState = state
            })
        }
    }

    private unsubscribe(): void {
        if(this.subscription !== Subscription.EMPTY) {
            this.subscription.unsubscribe();
            this.subscription = Subscription.EMPTY;
        }
    }

    componentDidUpdate(previousState : BlocBuilderProps<B,S>) {
        const oldState = previousState.bloc.state;
        const currentState = this.bloc.state;
        if(oldState !== currentState) {
            if(this.subscription !== Subscription.EMPTY) {
                this.unsubscribe();
                this.bloc = this.bloc;
                this.previousState = this.previousState;
            }
            this.subscribe();
        }

    }

    componentWillUnmount() {
        this.unsubscribe();
    }

    render() {
        return this.builder(this.state.blocState);
    }

 }
