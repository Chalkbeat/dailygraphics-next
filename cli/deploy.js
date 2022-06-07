var deploy = require("../lib/deployGraphic");
var { completeSlug } = require("./util");

module.exports = async function(config, argv, slugs) {
  for (var slug of slugs) {
    try {
      slug = await completeSlug(config.root, slug);
      await deploy(config, slug);
    } catch (err) {
      console.error(err);
    }
  }
};

module.exports.command = "deploy SLUGS";
module.exports.description = "deploy the chosen graphics to S3";