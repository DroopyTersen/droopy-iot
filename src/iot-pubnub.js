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

        var trigger = function(key, payload, target = _deviceId, responseKey = "") {
            ensureConnection().then(() => {
                var timestamp = (new Date()).toISOString();
                var event = {
                    channel: target,
                    message: { key, payload, timestamp, target, responseKey, source: _deviceId }
                };
                pubnub.publish(event, function(status, response) {
                    console.log(status, response);
                })
            })
        };


        var request = function(key, payload, target = _deviceId, source = _deviceId) {
            var deferred;
            ensureConnection().then(() => {
                var responseKey = Date.now();
                var responseHandler = function(payload, e) {
                    // No point staying subscribed this this was a one and done thing
                    eventer.off(responseKey, responseHandler);
                    deferred.resolve(payload);
                };
                eventer.on(responseKey, responseHandler);
                trigger(key, payload, target, responseKey);
            })
            return new Promise((resolve, reject) => deferred = { resolve, reject });
        };

        var createResponseFunc = function(event) {
            return (event && event.message && event.message.responseKey) 
                ? (payload) => trigger(event.message.responseKey, payload, event.message.source)
                : () => {}
        };

        pubnub.addListener({
            status: function(statusEvent) {
                if (statusEvent.category === "PNConnectedCategory") {
                    _isConnected = true;
                }
            },
            message(event) {
                if (event.message && event.message.key) { 
                    event.respond = createResponseFunc(event);
                    eventer.trigger(event.message.key, event.message.payload, event);
                }
            }
        });
        pubnub.subscribe({ channels: [_deviceId] });

        return {
            trigger,
            request,
            subscribe: (key, handler) => {
                eventer.on(key, handler)
            },
            unsubscribe() {
                eventer.off(key, handler)
            }
        }
    }
}