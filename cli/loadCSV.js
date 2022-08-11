
var csv = require("csv-parse");
var fs = require("fs").promises;
var path = require("path");
var { completeSlug } = require("./util");
var expand = require("../lib/expandMatch");

var csvData = async function(config, argv, [s]) {

    try {
      
      var slug = await completeSlug(config.root, s);

      var folder = path.join(config.graphicsPath, slug);
      var files = await expand(config.graphicsPath, folder, ['**/*.csv']);

      var extracted = {};

      console.log(files);

      for (var file of files) {    
        var parser = csv.parse({
          columns: true,
          cast: true
        });
        var handle = await fs.open(file.full);
        var stream = handle.createReadStream();
        stream.pipe(parser);
        var output = [];
        var keyed = false;
        for await (var record of parser) {
          // check to see if we've found a keyed row
          if (record.key || keyed) {
            // swap output to an object the first time it happens
            if (output instanceof Array) {
              output = {};
              keyed = true;
            }
            output[record.key] = record;
            delete record.key;
          } else {
            output.push(record);
          }
        }
        console.log(output);

        /* add filename info, sanitize it, add output to large csv object under sanitized name */

        var sanitized = path.basename(file.full)
          .replace(".csv", "")
          .replace(/\W(\w)/g, function(_, letter) { return letter.toUpperCase() });
        console.log("Loaded onto csv data as", sanitized);
        extracted[sanitized] = output;
      };

      console.log(extracted);

    } catch (err) {
      console.error(err);
    }

}

module.exports = csvData;

module.exports.command = "load CSV";
module.exports.description = "read CSV files";