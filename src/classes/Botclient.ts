import 'dotenv/config'
import { Client, ClientEvents } from 'discord.js'

export default class BotClient extends Client {
  constructor () {
    super({
      intents: [
        'Guilds',
        'GuildMembers',
        'MessageContent',
        'GuildVoiceStates',
        'GuildMessages'
      ]
    })

    this.token = process.env.DISCORD_TOKEN!
    this.login()
  }

  public registEvent = (event: keyof ClientEvents, func: Function, ...extra: any[]) =>
    this.on(event, (...args) => func(...args, ...extra))

  public get totalMemberCount () {
    return this.guilds.cache
      .reduce((prev, curr) => prev + curr.memberCount, 0)
  }

  public async totalGuildCount () {
    if (!this.shard) return this.guilds.cache.size

    const guildSizes = await this.shard
      .fetchClientValues('guilds.cache.size') as number[]

    return guildSizes.reduce((prev, curr) => prev + curr, 0)
  }
}
