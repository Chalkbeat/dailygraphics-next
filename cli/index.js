var { parseArgs, styleText } = require("node:util");
var path = require("path");

var configuration = require("../lib/configuration");

var help = function() {
  var helpable = Object.keys(commands).filter(c => commands[c].command)
  var list = helpable.map(c => 
    `${styleText("blue", commands[c].command)} - ${commands[c].description}`);
  console.log(`
Commands available from the command line:
${list.join("\n")}

[BRACES] signal optional arguments.`);
};

var commands = {
  help,
  create: require("./create"),
  deploy: require("./deploy"),
  copy: require("./copy"),
  copyedit: require("./copyedit"),
  sync: require("./sync"),
  "try": require("./try")
};

var run = async function() {
  var args = parseArgs({ strict: false, allowNegative: true });
  var [script, ...positional] = args.positionals;

  var config = await configuration.load("config.json");

  if (!(script in commands)) script = "help";

  var command = commands[script];
  command(config, args.values, positional);
};

run();
