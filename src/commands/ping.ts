import { CommandData } from '../types/data'
import { Client } from 'discord.js'

export default async function PingCommand ({ interaction }: CommandData) {
  const client: Client = interaction.client
  const days = Math.floor(client.uptime! / 86400000)
  const hours = Math.floor(client.uptime! / 3600000) % 24
  const minutes = Math.floor(client.uptime! / 60000) % 60
  const seconds = Math.floor(client.uptime! / 1000) % 60
  const uptime = `\`${days}일 ${hours}시간 ${minutes}분 ${seconds}초\``
  await interaction.editReply({ content: `퐁! 현재핑은 \`${client.ws.ping}ms\`이에요 디스코드 API와는 \`${Date.now() - interaction.createdTimestamp}ms\`걸리네요 (업타임 : ${uptime})` })
}

export const metadata = {
  name: 'ping',
  description: '봇의 핑을 확인합니다',
  category: 'system',
  permission: { role: '' },
  botperm: []
}
