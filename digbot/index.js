import { Block } from "pixelwalker.js";
import Client, { createPlacer, parseMessage, parseStructure } from "../index.js";
import SpaceShip from "../structures/spaceship.js"

const spaceShipStructure = parseStructure(SpaceShip)

/** @param {string} world_title */
async function createWorld(world_title = "New World") {
	const game = await Client(
		{ world_title, world_height: 400, world_width: 636 }
	);
	const placer = createPlacer(game);

	game.listen("playerChatPacket", ({ playerId, message }) => {
		const [command, ...args] = parseMessage(message);
		switch (command) {
			case "!exit":
				if ([process.env.OWNER_USER, process.env.DIGBOT_USER].includes(game.players[playerId].properties.username))
					game.close()
				break;
			default:
				break;
		}
	});


	game.listen("playerInitPacket", (message) => {
		placer(spaceShipStructure)
		
		game.send("playerResetPacket", {
			position: { '$typeName': 'WorldPackets.PointInteger', x: 318, y: 15 }
		})
	})

	let respawn = false;

	// game.listen("playerJoinedPacket", () => {
	// 	if (!respawn) {
	// 		game.send("playerChatPacket", { message: "/resetplayer" })
	// 		respawn = true
	// 	}
	// })

	game.listen("playerResetPacket", console.log)

	return game
}

const world = await createWorld("---");
world.bind()

// const game = await Client("r88c52511042aec");

// game.listen("worldBlockPlacedPacket", console.log);
// game.listen("playerMovedPacket", (e) => {
// 	if (e.spaceJustDown) {
// 		const sum = e.horizontal + e.vertical
// 		if (sum === 1 || sum === -1) {
// 			console.log("dig")
// 		}
// 		console.log(e.horizontal, e.vertical, e.position.x, e.position.y)
// 	}
// })
// game.bind();