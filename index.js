import "dotenv/config"
import { LobbyClient } from "pixelwalker.js"

const BotClient = await LobbyClient.withUsernamePassword(process.env.DIGBOT_EMAIL, process.env.DIGBOT_PASS)
const OwnerClient = await LobbyClient.withUsernamePassword(process.env.OWNER_EMAIL, process.env.OWNER_PASS)

const Client = (/** @type {0|1} */ digit = 0) => {
	if (digit === 0) {
		return BotClient
	} else if (digit === 1) {
		return OwnerClient;
	} else {
		throw new Error('Invalid digit. Expected 0 or 1.');
	}
}

export default Client