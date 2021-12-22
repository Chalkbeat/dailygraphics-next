// MemoryPalace is an infinitely-partitionable, non-expiring cache

var clone = typeof structuredClone == "function" ? structuredClone :  v => JSON.parse(JSON.stringify(v));

module.exports = function(app) {
  var MemoryPalace = function() {
    this.clear();
  };

  MemoryPalace.prototype = {
    partition: function(...path) {
      var segment = path.shift();
      var p = this.partitions[segment];
      if (!p) {
        p = this.partitions[segment] = new MemoryPalace();
      }
      if (path.length) {
        return p.partition(...path);
      }
      return p;
    },
    get: function(key) {
      return this.data[key];
    },
    // support getting a distinct clone
    // this helps with running multiple templating processes during deploy
    // as it prevents them from mutating each others' data
    getCloned: function(key) {
      return clone(this.data[key]);
    },
    set: function(key, value) {
      this.data[key] = value;
    },
    clear: function() {
      this.data = {};
      this.partitions = {};
    }
  };

  app.set("cache", new MemoryPalace());
};
