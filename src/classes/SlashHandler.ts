import 'dotenv/config'
import { join } from 'path'
import { readdirSync } from 'fs'
import BotClient from './Botclient'
import DatabaseClient from './Database'
import { ApplicationCommandData, CommandInteraction } from 'discord.js'
import { Logger } from '../utils/Logger'
import { Command } from '../types'
const knex = new DatabaseClient().db

export default class SlashHandler {
  public commands: Map<string, Command>
  private readonly knex = new DatabaseClient().db
  constructor () {
    this.commands = new Map()

    const commandPath = join(__dirname, '../commands')
    const commandFiles = readdirSync(commandPath)

    for (const commandFile of commandFiles) {
      const commandName = commandFile.split('.').slice(0, -1).join('.')
      this.commands.set(commandName, require(join(__dirname, '../commands/' + commandFile)))
    }
  }

  public async runCommand (interaction: CommandInteraction, db: DatabaseClient) {
    const commandName = interaction.commandName
    const command = this.commands.get(commandName)

    if (!command) return
    if (!interaction) return

    command.default({ interaction, slash: this, knex })
  }

  public async registCachedCommands (client: BotClient): Promise<void> {
    if (!client.application) return Logger.warning('system').put('application not ready').out()

    const metadatas = [] as ApplicationCommandData[]
    for (const command of this.commands.values()) {
      metadatas.push(command.metadata)
    }

    if (process.env.ENVIROMENT?.toUpperCase() === 'DEV') {
      await client.application.commands.set([], process.env.DISCORD_DEV_GUILD_ID!)
      await client.application.commands.set(metadatas, process.env.DISCORD_DEV_GUILD_ID!)

      Logger.success('Discord').put('Slash Command Registerd').next('guild').put(process.env.DISCORD_DEV_GUILD_ID).out()
      return
    }

    await client.application.commands.set([])
    await client.application.commands.set(metadatas)
    Logger.success('Discord').put('Slash Command Registerd Globally').out()
  }
}
