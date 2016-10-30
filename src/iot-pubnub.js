var PubNub = require("pubnub");
var EventAggregator = require("droopy-events");
var config = require("./pubnub.config");

module.exports = {
    register(deviceId) {

        var eventer = new EventAggregator();
        var pubnub = new PubNub(config);
        var _isConnected = false;
        var ensureConnection = () => {
            var checkConnection = function(resolve) {
                if (_isConnected) resolve()
                else setTimeout(() => checkConnection(resolve), 25)
            }
            return new Promise(checkConnection);
        };

        var _deviceId = deviceId;

        var trigger = function(key, payload, target = _deviceId, source = _deviceId) {
            ensureConnection().then(() => {
                var timestamp = (new Date()).toISOString();
                var event = {
                    channel: target,
                    message: { key, payload, source, timestamp, target }
                };
                pubnub.publish(event, function(status, response) {
                    console.log(status, response);
                })
            })
        };


        pubnub.addListener({
            status: function(statusEvent) {
                if (statusEvent.category === "PNConnectedCategory") {
                    _isConnected = true;
                }
            },
            message(event) {
                if (event.message && event.message.key) { 
                    eventer.trigger(event.message.key, event.message.payload, event);
                }
            }
        });
        pubnub.subscribe({ channels: [_deviceId] });

        return {
            trigger,
            subscribe: (key, handler) => {
                eventer.on(key, handler)
            },
            unsubscribe() {
                eventer.off(key, handler)
            }
        }
    }
}