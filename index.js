import "dotenv/config";
import { LobbyClient, Block } from "pixelwalker.js";
const BotClient = await LobbyClient.withUsernamePassword(process.env.DIGBOT_EMAIL, process.env.DIGBOT_PASS);
const OwnerClient = await LobbyClient.withUsernamePassword(process.env.OWNER_EMAIL, process.env.OWNER_PASS);
if (!BotClient) {
	console.error("Failed to initialize BotClient. Exiting...");
	process.exit(1);
}
if (!OwnerClient) {
	console.error("Failed to initialize OwnerClient. Exiting...");
	process.exit(1);
}
const Client = (options, digit = 0) => {
	const selectedClient = digit === 0 ? BotClient : OwnerClient; // Select client based on digit
	if (typeof options === "string") {
		return selectedClient.connection(options); // Handle string case for connection
	}
	else {
		return selectedClient.createUnsavedWorld(options); // Handle world creation with options
	}
};
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
export default Client;
export function parseMessage(message) {
	const result = [];
	let current_word = "", inside_single_quote = false, inside_double_quote = false, i = 0;
	while (i < message.length) {
		const char = message[i];
		if (char === "\\" && i + 1 < message.length) {
			current_word += message[i + 1];
			i += 2;
			continue;
		}
		if (char === "'" && !inside_double_quote) {
			inside_single_quote = !inside_single_quote;
			i += 1;
			continue;
		}
		if (char === '"' && !inside_single_quote) {
			inside_double_quote = !inside_double_quote;
			i += 1;
			continue;
		}
		if (char === ' ' && !inside_single_quote && !inside_single_quote) {
			if (current_word) {
				result.push(current_word);
				current_word = "";
			}
		}
		else {
			current_word += char;
		}
		i += 1;
	}
	if (current_word !== "")
		result.push(current_word);
	return result;
}
export function createPlacer(client, maxItems = 600) {
	return (changes) => {
		const groupedChanges = new Map();
		// Group changes by a unique key
		changes.forEach(change => {
			const key = `${change.layer}-${change.blockId}-${(change.extraFields).toString()}`;
			if (!groupedChanges.has(key)) {
				groupedChanges.set(key, {
					blockId: change.blockId,
					layer: change.layer,
					extraFields: change.extraFields,
					positions: []
				});
			}
			groupedChanges.get(key)?.positions.push(change);
		});
		// Deduplicate positions within each group
		groupedChanges.forEach(group => {
			const uniquePositions = new Set();
			group.positions = group.positions.filter(position => {
				const posKey = `${position.x}-${position.y}`;
				if (uniquePositions.has(posKey)) {
					return false;
				}
				uniquePositions.add(posKey);
				return true;
			});
		});
		// Helper function to map positions
		function map(block) {
			return {
				x: block.x,
				y: block.y,
				$typeName: "WorldPackets.PointInteger"
			};
		}
		// Send grouped changes in chunks
		groupedChanges.forEach(group => {
			const { positions } = group;
			for (let i = 0; i < positions.length; i += maxItems) {
				const chunk = positions.slice(i, i + maxItems);
				const payload = {
					...group,
					positions: chunk.map(map),
					isFillOperation: false,
				};
				client.send("worldBlockPlacedPacket", payload)
			}
		});
	};
}

const processArray = arr => arr.flatMap(subArr => subArr.length === 1 ? subArr : Array.from({ length: subArr[1] - subArr[0] + 1 }, (_, i) => subArr[0] + i));


function expandPosition(position) {
	const result = [];
	const [xPart, yPart] = position.split(',');
	const xRange = processArray(xPart.split(':').map(x => x.split('-').map(Number)))
	const yRange = processArray(yPart.split(':').map(y => y.split('-').map(Number)))

	xRange.forEach(x => {
		yRange.forEach(y => {
			result.push({ x, y });
		});
	});

	return result;
}
export function parseStructure(structure) {
	const changes = []
	const blocks = new Map()

	structure.forEach((block) => {
		block.positions.forEach(position => {
			const expandedPositions = expandPosition(position)
			const blockData = blocks.has(block.type) ?
				blocks.get(block.type) :
				new Block(block.type)
			blocks.set(block.type, blockData)

			expandedPositions.forEach(({ x, y }) => {
				const change = {
					x, y,
					layer: block.layer,
					blockId: blockData.id,
					extraFields: new Uint8Array(block.extraFields ? block.extraFields : []),
					fill: block.fill ? true : false
				}

				changes.push(change)
			})
		})
	})

	return changes
}