var sync = require("../lib/syncAssets");
var { completeSlug } = require("./util");

module.exports = async function(config, argv, slugs) {
  for (var slug of slugs) {
    try {
      slug = await completeSlug(config.root, slug);
      await sync(config, slug);
    } catch (err) {
      console.log(err);
    }
  }
};