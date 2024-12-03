import "dotenv/config"
import { Block, GameClient, LobbyClient } from "pixelwalker.js"

const BotClient = await LobbyClient.withUsernamePassword(
	process.env.DIGBOT_EMAIL,
	process.env.DIGBOT_PASS
);

const OwnerClient = await LobbyClient.withUsernamePassword(
	process.env.OWNER_EMAIL,
	process.env.OWNER_PASS
);

if (!BotClient) {
	console.error("Failed to initialize BotClient. Exiting...");
	process.exit(1);
}

if (!OwnerClient) {
	console.error("Failed to initialize OwnerClient. Exiting...");
	process.exit(1);
}

const Client = (options: {
	world_title: string;
	world_width?: 400 | 375 | 350 | 325 | 300 | 275 | 250 | 225 | 200 | 175 | 150 | 125 | 100 | 75 | 50 | 636;
	world_height?: 400 | 375 | 350 | 325 | 300 | 275 | 250 | 225 | 200 | 175 | 150 | 125 | 100 | 75 | 50;
} | string, digit: 0 | 1 = 0) => {
	const selectedClient = digit === 0 ? BotClient : OwnerClient;  // Select client based on digit

	if (typeof options === "string") {
		return selectedClient.connection(options);  // Handle string case for connection
	} else {
		return selectedClient.createUnsavedWorld(options);  // Handle world creation with options
	}
}

export default Client

export function parse(message: string) {
	const result = [];
	let current_word = "", inside_single_quote = false, inside_double_quote = false, i = 0;

	while (i < message.length) {
		const char = message[i];

		if (char === "\\" && i + 1 < message.length) {
			current_word += message[i + 1]
			i += 2;
			continue
		}

		if (char === "'" && !inside_double_quote) {
			inside_single_quote = !inside_single_quote
			i += 1
			continue
		}

		if (char === '"' && !inside_single_quote) {
			inside_double_quote = !inside_double_quote
			i += 1
			continue
		}

		if (char === ' ' && !inside_single_quote && !inside_single_quote) {
			if (current_word) {
				result.push(current_word)
				current_word = ""
			}
		} else {
			current_word += char
		}

		i += 1
	}

	if (current_word !== "") result.push(current_word)

	return result
}

type Change = {
	x: number
	y: number
	layer: number
	blockId: number
	extraFields: Uint8Array
}

export function createChangeSender(client: GameClient, maxItems = 600) {
	return (changes: Change[]) => {
		const groupedChanges: Map<string, {
			blockId: number;
			layer: number;
			extraFields: Uint8Array;
			positions: { x: number; y: number; }[];
		}> = new Map();

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
		function map(block: { x: number; y: number; }) {
			return {
				x: block.x,
				y: block.y,
				$typeName: "WorldPackets.PointInteger"
			} as const;
		}

		// Send grouped changes in chunks
		groupedChanges.forEach(group => {
			const { blockId, layer, extraFields, positions } = group;
			for (let i = 0; i < positions.length; i += maxItems) {
				const chunk = positions.slice(i, i + maxItems);
				const payload = {
					positions: chunk.map(map),
					layer: layer,
					isFillOperation: false,
					blockId: blockId,
					extraFields: extraFields,
				};
				client.send("worldBlockPlacedPacket", payload);
			}
		});
	};
}