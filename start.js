import { spawn } from "child_process";
import fs from "fs"

const botName = process.argv[2];

/** @param {string} command @param {readonly string[]} args */
function runScript(command, args) {
	const process = spawn(command, args, { stdio: "inherit" });

	process.on("error", (err) => {
		console.error(`Failed to start process: ${err.message}`);
		process.kill(1)
	});

	process.on("exit", (code) => {
		if (code !== 0) { console.error(`Process exited with code: ${code}`) }
	});
}

if (botName === undefined) {
	runScript("node", ["index.js"]);
} else {
	const botPath = `./${botName}/index.js`;

	if (!fs.existsSync(botPath)) {
		console.error(`Bot '${botName}' not found.`);
		process.exit(1);
	}

	runScript("node", [botPath]);
}
