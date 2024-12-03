import Client from "../index.js";
import { parse } from "../helper.js";

const game = await Client(1).connection("r88c52511042aec")

/** @param {string | number} playerId */
function isValid(playerId) {
	if (game.players[playerId].properties.username !== process.env.OWNER_USER && game.players[playerId].properties.username !== process.env.DIGBOT_USER) return false
	return true
}

game.listen("playerChatPacket", ({ playerId, message }) => {
	const [command, ...args] = parse(message)
	switch (command) {
		case '!ping':
			game.send('playerChatPacket', {
				message: `Pong, ${game.players[playerId].properties.username}!`,
			})
			break;
		case '!exit':
			if (!isValid(playerId)) return
			game.close()
			break;
		case '!reset':
			if (!isValid(playerId)) return
			game.send("globalSwitchChangedPacket", {
				switchId: Number(args[0] ?? 0),
				enabled: Boolean(args[1] ?? false)
			})
		case '!remove':
			if (!isValid(playerId)) return
			game.send('playerChatPacket', {
				message: `/kick ${args[0]}`,
			})
			game.send('playerChatPacket', {
				message: `/unkick ${args[0]}`,
			})
		case "!test":
			if (!isValid(playerId)) return
			let positions = []
			for (let x = 0; x < 27; x++) {
				for (let y = 0; y < 26; y++) {
					positions.push({ x: x + 10, y: y + 10, $typeName: "WorldPackets.PointInteger" })
				}
			}
			console.log(positions.length)
			game.send("worldBlockPlacedPacket", {
				positions: positions.slice(0, 680),
				layer: 1,
				isFillOperation: true,
				blockId: 72,
				extraFields: new Uint8Array([0x03, 0x00, 0x00, 0x00, 0x00, 0x03, 0x00, 0x00, 0x00, 0x02, 0x03, 0x00, 0x00, 0x00, 0x02])
			})
		default:
			break;
	}
})

game.listen("worldBlockPlacedPacket", console.log)

// game.listen("playerMovedPacket", (e) => {
// 	if (e.spaceJustDown) {
// 		const sum = e.horizontal + e.vertical
// 		if (sum === 1 || sum === -1) {
// 			console.log("dig")
// 		}
// 		console.log(e.horizontal, e.vertical, e.position.x, e.position.y)
// 	}
// })

game.bind();