import 'dotenv/config'
import BotClient from '../classes/Botclient'
import { Logger } from '../utils/Logger'
import { ActivityType } from 'discord.js'
import SlashHandler from '../classes/SlashHandler'
import { ScamChecker } from '../classes/ScamChecker'
import { processMessageLogger } from '../classes/MessageLogger'

export default async function onReady (client: BotClient, slash: SlashHandler) {
  if (!client.user) return
  Logger.success('Discord').put(client.user?.tag).out()
  if (process.env.ENVIROMENT === 'ci') {
    Logger.warning('Ci').put('exiting process with code 0').out()
    return process.exit(0)
  }
  const guild = await client.guilds.fetch(process.env.DISCORD_GUILD_ID!)
  await processMessageLogger(client, guild)
  await ScamChecker(client, guild)

  Logger.info('Discord').put(`${client.totalMemberCount} members in shard`).out()
  client.user.setActivity('요루플레이스', { type: ActivityType.Watching })

  if (process.env.REFRESH_SLASH_COMMAND_ON_READY !== 'true') return

  await slash.registCachedCommands(client)
}
