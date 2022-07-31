import { Interaction } from 'discord.js'
import SlashHandler from '../classes/SlashHandler'
import DatabaseClient from '../classes/Database'
import { Logger } from '../utils/Logger'

export default async function onInteractionCreate (interaction: Interaction, slash: SlashHandler, db: DatabaseClient) {
  if (!interaction.isCommand()) return

  if (!interaction.guild) {
    interaction.reply({ content: '요루플레이스 봇은 디엠에서 사용이 불가해요!' })
    Logger.log('Interaction').put(interaction.commandName).next('options').put(JSON.stringify(interaction.options.data)).next('guild').put('DM').next('user').put(`${interaction.user.username}#${interaction.user.discriminator} (${interaction.user.id})`).out()
    return
  }

  Logger.log('Interaction').put(interaction.commandName).next('options').put(JSON.stringify(interaction.options.data)).next('guild').put(interaction.guild.id).next('user').put(`${interaction.user.username}#${interaction.user.discriminator} (${interaction.user.id})`).out()
  await interaction.deferReply().catch(() => {})

  await slash.runCommand(interaction, db)
}
