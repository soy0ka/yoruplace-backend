/* eslint-disable no-labels */
import 'dotenv/config'
import cors from 'cors'
import helmet from 'helmet'
// import { Logger } from '../utils/Logger'
import DiscordOauth2 from '../classes/Discord'
import DatabaseClient from '../classes/Database'
import MiddleWare from '../classes/Middleware'
import express, { Request, Response, NextFunction } from 'express'
import { WebhookClient, EmbedBuilder } from 'discord.js'

const app = express.Router()
const knex = new DatabaseClient().db
const CNGWebhook = new WebhookClient({ url: process.env.DISCORD_CNG_WEBHOOK as string })

app.use(cors())
app.use(helmet())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use(MiddleWare.verify)
app.get('/', async (req: Request, res: Response, next: NextFunction) => {
  const [user] = await knex('Users').where('discordId', res.locals.user.id)
  if (!user) return res.status(404).json({ code: 404, message: 'User not found' })
  const invite = await DiscordOauth2.joinGuild(user.AccessToken, user.discordId)
  if (invite.error) return res.status(500).json({ code: 500, message: 'Failed to join guild' })
  const embed = new EmbedBuilder()
    .setTitle('입국!')
    .setColor('#EAACB8')
    .setDescription(`${res.locals.user.username}#${res.locals.user.discriminator}님이 입국했습니다.`)
    .setThumbnail(`https://cdn.discordapp.com/avatars/${res.locals.user.id}/${res.locals.user.avatar}?size=1024`)
    .setFooter({ text: '요루플레이스' })
    .setTimestamp()
  CNGWebhook.send({ embeds: [embed] })
  res.status(200).json({ code: 200, message: 'Success' })
})

export default app
