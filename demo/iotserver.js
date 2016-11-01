// var droopyIot = require("../node_modules/droopy-iot/entries/entry.server");
var droopyIot = require("../entries/entry.server");
var server = new droopyIot.Server("demo-server");
server.start();