import Client from "../index.js";

const game = await Client().connection("djtqrcjn4fzyhi8")

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