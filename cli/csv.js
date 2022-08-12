
var loadCSV = require("../lib/loadCSV");
var { completeSlug } = require("./util");

var command = async function(config, argv, [s]) {

  var slug = await completeSlug(config.root, s);
  var CSV = await loadCSV(config, slug);
  console.log(CSV);

}

module.exports = command;

module.exports.command = "load SLUG";
module.exports.description = "read CSV files from a folder with the matching SLUG";