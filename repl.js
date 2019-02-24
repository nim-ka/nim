const Nim = require("./nim.js");
const nimInstance = new Nim();

if (process.argv[2]) {
	const fs = require("fs");
	
	console.log("\x1b[1m\x1b[37mReading file...\x1b[0m");
	
	fs.readFile(process.argv[2], (e, d) => {
		if (e) {
			throw e;
		}
		
		console.log("\x1b[1m\x1b[36mRead file!\n\x1b[37mParsing...\n-----\x1b[0m");
		console.time("Elapsed");
		process.stdout.write(nimInstance.run(d.toString()).output);
		console.log("\x1b[1m\x1b[37m-----\n\x1b[36mDone parsing!");
		console.timeEnd("Elapsed");
		process.stdout.write("\x1b[0m");
		
		process.exit(0);
	});
} else {
	const readline = require("readline");

	const io = readline.createInterface({
		input: process.stdin,
		output: process.stdout,
		terminal: true
	});
	
	(function prompt () {
		io.question("> ", function (line) {
			if (line.toLowerCase() == ".exit") {
				process.exit(0);
			} else {
				try {
					let ret = nimInstance.run(line);
					console.log(ret.output);
					console.log(`\x1b[32m${ret.result}\x1b[0m`);
				} catch (err) {
					console.error(err);
				}
			
				prompt();
			}
		})
	})();
}
