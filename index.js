import "dotenv/config"
import { LobbyClient } from "pixelwalker.js"

const BotClient = await LobbyClient.withUsernamePassword(process.env.DIGBOT_EMAIL, process.env.DIGBOT_PASS)
const OwnerClient = await LobbyClient.withUsernamePassword(process.env.OWNER_EMAIL, process.env.OWNER_PASS)

export { BotClient, OwnerClient }