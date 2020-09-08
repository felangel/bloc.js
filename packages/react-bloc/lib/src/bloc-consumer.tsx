import * as React from 'react'
import { Bloc } from '@felangel/bloc'
import { BlocProvider } from '../react-bloc'

export type BlocConsumerBuilder<B> = (bloc: B) => JSX.Element

export type BlocConsumerProps<B extends Bloc<any, any>> = {
  type: string
  consumer: BlocConsumerBuilder<B>
}

export function BlocConsumer<B extends Bloc<any, any>>(props: BlocConsumerProps<B>): JSX.Element {
  const context = BlocProvider.context<B>(props.type)
  return <context.Consumer>{props.consumer}</context.Consumer>
}
