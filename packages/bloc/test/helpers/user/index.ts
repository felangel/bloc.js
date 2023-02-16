import { Bloc } from '../../../lib/bloc'
import { BlocEvent } from '../../../lib/bloc'

export type User = {
  name: {
    first: string
    last: string
  }
  age: number
}

type UserStatus = 'initial' | 'loading' | 'ready' | 'failed'

export class UserState {
  constructor(
    public data: User = {
      age: 0,
      name: {
        first: '',
        last: '',
      },
    },
    public status: UserStatus = 'initial'
  ) {}

  ready(data: User) {
    return new UserState(data, 'ready')
  }

  loading() {
    return new UserState(this.data, 'loading')
  }

  failed() {
    return new UserState(this.data, 'failed')
  }
}

export abstract class UserEvent extends BlocEvent {}

export class UserNameChangedEvent extends UserEvent {
  constructor(public name: { first: string; last: string }) {
    super()
  }
}

export class UserAgeChangedEvent extends UserEvent {
  constructor(public age: number) {
    super()
  }
}

export class UserBloc extends Bloc<UserEvent, UserState> {
  constructor() {
    super(new UserState())

    this.on(UserNameChangedEvent, (event, emit) => {
      emit(
        this.state.ready({
          ...this.state.data,
          name: event.name,
        })
      )
    })

    this.on(UserAgeChangedEvent, (event, emit) => {
      emit(
        this.state.ready({
          ...this.state.data,
          age: event.age,
        })
      )
    })
  }
}
