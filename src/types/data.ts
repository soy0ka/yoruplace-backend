import { CommandInteraction } from 'discord.js'

import SlashHandler from '../classes/SlashHandler'
import { Knex } from 'knex'

export interface ChannelData {
  id: string
  guild: string
  theme: number
}

export interface ThemeData {
  id: number
  name: string
  url: string
}

export interface CommandData {
  knex: Knex
  slash: SlashHandler
  interaction: CommandInteraction
}
