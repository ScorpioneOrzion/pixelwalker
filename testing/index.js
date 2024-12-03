import Client, { createPlacer, parse } from "../index.js";
const game = await Client("r88c52511042aec", 1);
const placer = createPlacer(game);
game.listen("playerChatPacket", ({ playerId, message }) => {
    const [command, ...args] = parse(message);
    switch (command) {
        default:
            break;
    }
});
game.listen("worldBlockPlacedPacket", console.log);
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
//# sourceMappingURL=index.js.map