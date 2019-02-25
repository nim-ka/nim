class Token {
	constructor (type, value, last, next) {
		this.type = type;
		this.value = value;
		this.last = last;
		this.next = next;
	}
	
	copy () {
		return new Token(this.type, this.value, this.last, this.next);
	}
}

const default_functions = {
	print: {
		args: 1,
		run: (args) => ({
			result: args[0],
			output: args[0]
		})
	},
	println: {
		args: 1,
		run: (args) => ({
			result: args[0],
			output: args[0] + "\n"
		})
	},
	epoch: {
		args: 0,
		run: (args) => ({
			result: Date.now(),
			output: ""
		})
	}
};

class Nim {
	constructor (functions, variables, conditions, outerScope) {
		this.functions = functions || default_functions;
		this.variables = variables || {};
		this.outerScope = outerScope || null;
	}
	
	// Tokenizer
	tokenize (code) {
		let tokens = [];
	
		for (let index = 0; index < code.length;) {
			while (/[ \t\r\f]/.test(code[index])) {
				index ++;
			}
		
			let char = code[index];
		
			if (!char) {
				break;
			}
		
			switch (true) {
				case char == "#": {
					// Comment
					while (code[++index] && !/\r|\n/.test(code[index]));
				
					break;
				} case char == "\n" || char == ";": {
					// EOL
				
					tokens.push(new Token("eol"));
				
					break;
				} case char == "{": {
					// Start block
					tokens.push(new Token("startblock"));
				
					break;
				} case char == "}": {
					// End block
					tokens.push(new Token("endblock"));
				
					break;
				} case char == "=": {
					// Could be equality or set
					if (code[index + 1] == "=") {
						index ++;
						tokens.push(new Token("operation", "=="));
					} else {
						tokens.push(new Token("set"));
					}
				
					break;
				} case ["+", "-", "*", "/", "<", ">", "@"].indexOf(char) > -1: {
					// Could be straight operation or variable operator assignment
					if (code[index + 1] == "=") {
						index ++;
					
						if (char == "<" || char == ">") {
							tokens.push(new Token("operation", char + "="));
						} else {
							tokens.push(new Token("opassignment", char));
						}
					} else {
						tokens.push(new Token("operation", char));
					}
				
					break;
				} case char == "%": {
					// Could be modulo, intdiv, modulo assignment, intdiv assignment
					let op;
				
					if (code[index + 1] == "/") {
						index ++;
						op = "%/";
					} else {
						op = "%";
					}
				
					if (code[index + 1] == "=") {
						index ++;
						tokens.push(new Token("opassignment", op));
					} else {
						tokens.push(new Token("operation", op));
					}
				
					break;
				} case char == "$": {
					let val = "";
				
					while (code[++index] && /\w/.test(code[index])) {
						val += code[index];
					}
				
					if (!val) {
						throw new Error(`Encountered variable with no name.`);
					}
				
					index --;
				
					tokens.push(new Token("variable", val));
				
					break;
				} case /\d/.test(char): {
					let hex = false;
					let val = "";
				
					if (!+char) {
						val = "0";
					
						if ([".", "b", "o", "x"].indexOf(code[++index]) > -1 || /\d/.test(code[index])) {
							if (code[index] == "x") {
								hex = true;
							}
						
							val += code[index];
						} else {
							tokens.push(new Token("data", 0));
							index --;
							break;
						}
					
						index ++;
					}
				
					while (code[index] && (hex ? /[\dA-Fa-f\.]/ : /[\d\.]/).test(code[index])) {
						val += code[index++];
					}
				
					index --;
				
					tokens.push(new Token("data", Number(val)));
				
					break;
				} case ["\"", "'"].indexOf(char) > -1: {
					let val = "";
					let delim = char;
					let bs = false;
				
					while (code[++index] != delim || bs) {
						if (!code[index]) {
							throw new Error("String without ending");
						}
					
						if (!bs && code[index] == "\\") {
							bs = true;
						} else {
							if (bs && code[index] == "n") {
								val += "\n";
							} else {
								val += code[index];
							}
						
							bs = false;
						}
					}
				
					tokens.push(new Token("data", val));
				
					break;
				} case /\w/.test(char): {
					let val = char;
				
					while (code[++index] && /\w/.test(code[index])) {
						val += code[index];
					}
				
					if (code[index] + code[index + 1] == "()") {
						index += 2;
					
						tokens.push(new Token("function", val));
					} else if (["true", "false"].indexOf(val) > -1) {
						tokens.push(new Token("data", val == "true"));
					} else if (["if", "elseif", "else", "def", "while"].indexOf(val) > -1) {
						tokens.push(new Token(val, val));
					} else {
						throw new Error(`Unrecognized identifier: ${val}`);
					}
				
					index --;
				
					break;
				} default: {
					throw new Error(`Unrecognized character: ${char}`);
				}
			}
		
			index ++;
		}
	
		return (function joinTokens (tokens) {
			for (let i = 0; i < tokens.length; i ++) {
				for (let j = 0; j < tokens[i].length; j ++) {
					tokens[i][j].last = tokens[i][j - 1];
					tokens[i][j].next = tokens[i][j + 1];
			
					if (tokens[i][j].type == "block") {
						tokens[i][j].value = joinTokens(tokens[i][j].value);
					}
				}
			}
		
			return tokens;
		})(
			(function splitIntoStatements (tokens) {
				let t = [];
			
				for (let i = 0; i < tokens.length; i ++) {
					t.push([]);
				
					while (tokens[i] && tokens[i].type != "eol") {
						if (tokens[i].type == "block") {
							tokens[i].value = splitIntoStatements(tokens[i].value);
						}
					
						t[t.length - 1].push(tokens[i ++]);
					
						/*if (i >= tokens.length) {
							throw new Error("Code block does not end in semicolon." + JSON.stringify(tokens));
						}*/
					}
				}
			
				return t;
			})(
				(function splitIntoBlocks (tokens) {
					let s = 0;
					let t = [];
					let k = false;

					for (let i = 0; i < tokens.length; i ++) {
						if (tokens[i].type == "startblock") {
							s ++;

							k = true;
						} else if (tokens[i].type == "endblock" && !--s) {
							tokens = tokens.slice(0, i - t.length).concat([new Token("block", splitIntoBlocks(t.slice(1)))]).concat(tokens.slice(i + 1));

							i -= t.length;

							t = [];
							k = false;
						}

						if (k) {
							t.push(tokens[i]);
						}
					}

					return tokens;
				})(tokens)
			)
		);
	}
	
	// Parse method. Chains together calls of `parseStatement`
	parse (tokens) {
		let result;
		let output = "";
	
		for (let statement = 0; statement < tokens.length; statement ++) {
			let parsed = this.parseStatement(tokens[statement]);
		
			result = parsed.result;
			output += parsed.output;
		}
	
		return {
			result: result,
			output: output
		};
	}
	
	// Main parsing logic. Takes in an array of tokens in a statement and parses it.
	parseStatement (statement) {
		let result;
		let output = "";
	
		if (!statement.length) {
			return {
				result: result,
				output: output
			};
		}
	
		let token = statement[0];
	
		/*if (["if", "elseif", "else"].indexOf(token) < 0) {
			this.conditions = [];
		}*/
	
		// All new sub-parsers should:
		// - after completion, have token point to the last existing token of the statement (exception: "function" sub-parser)
		switch (token.type) {
			case "function": {
				let func = this.functions[token.value];
				let args = [];
			
				if (!func) {
					throw new Error(`Unknown function ${token.value}`);
				}
			
				token = token.next;
			
				while (token) {
					if (["data", "block", "variable"].indexOf(token.type) < 0) {
						throw new Error(`Unrecognized argument to function: Type ${token.type}, value ${token.value}`);
					}
				
					let parsed = this.shallowParseDataBlockVariable(token, output);
					let data = parsed.data;
					output = parsed.output;
				
					args.push(data);
				
					token = token.next;
				}
			
				if (args.length != func.args) {
					throw new Error(`Expected ${func.args} args, got ${args.length}`);
				}
			
				let res = func.run(args);
			
				result = res.result;
				output += res.output;
			
				break;
			} case "data":
			case "block":
			case "variable": {
				let data = token.value;
			
				if (token.type == "block") {
					let parsedBlock = this.parseBlock(token);
				
					if (!token.next) {
						return parsedBlock;
					}
				
					if (token.next.type != "operation") {
						throw new Error(`${token.next.type} directly after code block; did you mean to put a semicolon between?`);
					}
				
					data = parsedBlock.result;
					output += parsedBlock.output;
				} else if (token.type == "variable") {
					let scope = this;
				
					while (scope && !scope.variables.hasOwnProperty(data)) {
						scope = scope.outerScope;
					}
				
					if (!scope) {
						scope = this;
					}
				
					if (!token.next) {
						return {
							result: scope.variables[data],
							output: ""
						};
					}
				
					if (token.next.type == "set" || token.next.type == "opassignment") {
						token = token.next.next;
					
						if (!token) {
							throw new Error(`Nothing to assign variable $${data} to`);
						}
					
						if (["data", "block", "variable"].indexOf(token.type) < 0) {
							throw new Error(`Cannot assign token of type ${token.type} to variable $${data}`);
						}
					
						let parsed = this.shallowParseDataBlockVariable(token, output);
						let data2 = parsed.data;
						output = parsed.output;
					
						if (token.last.type == "set") {
							scope.variables[data] = data2;
						} else {
							scope.variables[data] = this.parseDataOperation(scope.variables[data], data2, token.last.value)
						}
					
						result = scope.variables[data];
					
						break;
					} else if (token.next.type == "operation") {
						data = scope.variables[data];
					} else {
						throw new Error(`Token of type "${token.next.type}" after variable, did you mean to put a semicolon in between?`);
					}
				} else if (!token.next) {
					return {
						result: data,
						output: ""
					};
				}
			
				while ((token = token.next) && token.type == "operation" && ["data", "block", "variable"].indexOf(token.next.type) > -1) {
					let operation = token.value;
					token = token.next;
				
					let parsed = this.shallowParseDataBlockVariable(token, output);
					let data2 = parsed.data;
					output = parsed.output;
				
					data = this.parseDataOperation(data, data2, operation);
				}
			
				if (token) {
					throw new Error(`Unnecessary token: Type ${token.type}, value ${token.value}`);
				}
			
				result = data;
			
				break;
			} case "if": {
				token = token.next;
			
				if (!token) {
					throw new Error("If statement does not have condition");
				}
			
				if (["data", "block", "variable"].indexOf(token.type) < 0) {
					throw new Error(`Expected condition, got token of type ${token.type}, value ${token.value}`);
				}
			
				let parsed = this.shallowParseDataBlockVariable(token, output);
				let condition = parsed.data;
				output = parsed.output;
			
				let conditions = [condition];
			
				token = token.next;
			
				if (!token) {
					throw new Error("If statement without code body");
				}
			
				if (condition) {
					if (["data", "block", "variable"].indexOf(token.type) < 0) {
						throw new Error(`Expected code body, got token of type ${token.type}, value ${token.value}`);
					}
				
					let parsed = this.shallowParseDataBlockVariable(token, output);
					result = parsed.data;
					output = parsed.output;
				}
			
				token = token.next;
			
				while (token && token.type == "elseif") {
					token = token.next;
			
					if (!token) {
						throw new Error("Elseif statement does not have condition");
					}
			
					if (["data", "block", "variable"].indexOf(token.type) < 0) {
						throw new Error(`Expected condition, got token of type ${token.type}, value ${token.value}`);
					}
			
					let parsed = this.shallowParseDataBlockVariable(token, output);
					let condition = parsed.data;
					output = parsed.output;
			
					token = token.next;
			
					if (!conditions.reduce((a, b) => a || b) && condition) {
						if (["data", "block", "variable"].indexOf(token.type) < 0) {
							throw new Error(`Expected code body, got token of type ${token.type}, value ${token.value}`);
						}
				
						let parsed = this.shallowParseDataBlockVariable(token, output);
						result = parsed.data;
						output = parsed.output;
					}
			
					conditions.push(condition);
				
					token = token.next;
				}
			
				if (!token) {
					break;
				}
			
				if (token.type == "else") {
					token = token.next;
			
					if (!conditions.reduce((a, b) => a || b)) {
						if (["data", "block", "variable"].indexOf(token.type) < 0) {
							throw new Error(`Expected code body, got token of type ${token.type}, value ${token.value}`);
						}
				
						let parsed = this.shallowParseDataBlockVariable(token, output);
						result = parsed.data;
						output = parsed.output;
					}
				}
			
				break;
			} case "def": {
				token = token.next;
			
				if (token.type != "data" || typeof token.value != "string") {
					throw new Error(`Expected string (for function name), got token of type ${token.type}, value ${token.value}`);
				}
			
				let name = token.value;
			
				token = token.next;
			
				if (!token) {
					throw new Error("def without code block");
				}
			
				let args = [];
			
				while (token.type == "variable") {
					args.push(token.value);
					token = token.next;
				}
			
				if (token.type != "block") {
					throw new Error(`Expected code block, got token of type ${token.type}, value ${token.value}`);
				}
			
				this.functions[name] = {
					args: args.length,
					run: (a) => {
						const scope = this.createChildScope();
					
						for (let i = 0; i < args.length; i ++) {
							scope.variables[args[i]] = a[i];
						}
					
						let result = token.value.map((statement) => scope.parseStatement(statement));
	
						if (result.length) {
							result = result.reduce((statement1, statement2) => ({
								result: statement2.result,
								output: statement1.output + statement2.output
							}));
						}
	
						return result;
					}
				};
			
				break;
			} case "while": {
				token = token.next;
			
				if (!token) {
					throw new Error("While loop does not have condition");
				}
			
				if (["data", "block", "variable"].indexOf(token.type) < 0) {
					throw new Error(`Expected condition, got token of type ${token.type}, value ${token.value}`);
				}
			
				let condition = token;
			
				token = token.next;
			
				if (!token) {
					throw new Error("While loop without code body");
				}
			
			
			
				break;
			} default: {
				throw new Error(`Unrecognized token: Type ${token.type}, value ${token.value}`);
			}
		}
	
		if (token && token.next) {
			throw new Error(`Unnecessary token: Type ${token.next.type}, value ${token.next.value}`);
		}
	
		return {
			result: result,
			output: output
		};
	}
	
	// Block parsing helper. Returns the same thing as `parseStatement`
	parseBlock (token) {
		// this is a failsafe, do not rely on this
		if (token.type != "block") {
			return;
		}
	
		const scope = this.createChildScope();
		let result = token.value.map((statement) => scope.parseStatement(statement));
	
		if (result.length) {
			result = result.reduce((statement1, statement2) => ({
				result: statement2.result,
				output: statement1.output + statement2.output
			}));
		}
	
		return result;
	}
	
	// DBV helper. Returns the same thing as `parseStatement`
	shallowParseDataBlockVariable (token, output) {
		if (["data", "block", "variable"].indexOf(token.type) < 0) {
			throw new Error(`Expected data/block/variable, got token of type ${token.type} and value ${token.value}`);
		}
	
		let data = token.value;
	
		if (token.type == "block") {
			let parsedBlock = this.parseBlock(token);
		
			data = parsedBlock.result;
			output += parsedBlock.output;
		} else if (token.type == "variable") {
			let scope = this;
		
			while (scope && !scope.variables.hasOwnProperty(data)) {
				scope = scope.outerScope;
			}
		
			if (!scope) {
				scope = this;
			}
		
			data = scope.variables[data];
		}
	
		return {
			data: data,
			output: output
		};
	}
	
	// Binary operation parsing helper.
	parseDataOperation (data, data2, operation) {
		switch (operation) {
			case "+": {
				data += data2;
				break;
			} case "-": {
				data -= data2;
				break;
			} case "*": {
				data *= data2;
				break;
			} case "/": {
				data /= data2;
				break;
			} case "%": {
				data %= data2;
				break;
			} case "%/": {
				data = Math.floor(data / data2);
				break;
			} case "@": {
				data = ["number", "boolean"].includes(typeof data) ? (+data).toString().split``.reverse()[data2] : data[data2]
				break;
			} case "<": {
				data = data < data2;
				break;
			} case ">": {
				data = data > data2;
				break;
			} case "<=": {
				data = data <= data2;
				break;
			} case ">=": {
				data = data >= data2;
				break;
			} case "==": {
				data = data == data2;
				break;
			}
		}
	
		return data;
	}
	
	// Child scope helper. Returns a new Nim object with `outerScope` set to `this`.
	createChildScope () {
		return new Nim(undefined, undefined, undefined, this);
	}
	
	// Runs Nim code.
	run (code) {
		return this.parse(this.tokenize(code));
	}
}

module.exports = Nim;
