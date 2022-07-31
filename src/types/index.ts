import { CommandData } from './data'

type CommandFn = (data: CommandData) => void
export interface Command extends CommandFn {
  default: CommandFn
  metadata:{
    name:string
    description:string
    category:string,
    permission:{ role: string }
  }
}
