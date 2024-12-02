import { BotClient } from "../index.js";

const game = await BotClient.connection("djtqrcjn4fzyhi8")

game.listen("playerChatPacket", ({ playerId, message }) => {
	switch (message) {
		case '!ping':
			game.send('playerChatPacket', {
				message: `Pong, ${game.players[playerId].properties.username}!`,
			})
			break;
		case '!exit':
			game.close()
			break;

		default:
			break;
	}
})

game.bind();