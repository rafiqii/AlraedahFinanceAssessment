import {Context as TelegrafContext} from 'telegraf'

export interface MySession {
    counter?: number
}

export interface MyContext extends TelegrafContext {
  session: MySession
}