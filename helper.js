/** @param {string} message */
export function parse(message) {
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

/** @param {string} worldName */
export function createWorld(worldName) {

}

export function placeBlock() {

}