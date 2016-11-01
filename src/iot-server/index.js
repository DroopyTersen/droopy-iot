var express = require('express');
var bodyParser = require("body-parser");
var droopyIot = require("../iot-pubnub");
var path = require("path");
var Server = function(name = "droopy-iot-server") {
    this.name = name;
    this.iot = droopyIot.register(name);
    this.app = express();
    this.app.use(bodyParser.json()); 
    this._configureRoutes();
};

Server.prototype._configureRoutes = function() {
    var self = this;
    this.app.get("/", (req, res) => res.sendFile(__dirname + "/views/home.html"))
    this.app.get('/trigger', (req, res) => res.sendFile(__dirname + "/views/trigger.html"))

    this.app.post('/trigger', (req, res) => {
        var event = req.body;
        try {
            if (event && event.key && event.target && event.source) {
                self.iot._trigger(event).then(result => res.send(result))
            } else {
                res.status(400).send({ message: "Invalid POST body. You need at lease 'key', 'target', and 'source'."});
            }
        } catch (err) {
            console.log("FAIL");
            console.log(err);
            res.status(500).send({ message: "Uh oh... " + err.message });
        }
    });

    this.app.use("/dist", express.static(path.resolve(__dirname + "/../../dist")))
};

Server.prototype.start = function(port) {
    port = port || process.env.PORT || 2000;
    var host = process.env.IP || "127.0.0.1"
    this.app.listen(port, process.env.IP, () => console.log('Server listening on port ' + port))
};

module.exports = Server;