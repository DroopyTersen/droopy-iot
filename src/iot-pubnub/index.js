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

        var _trigger = function(message) {
            return new Promise((resolve, reject) => {
                if (message.key && message.target && message.source) {
                    ensureConnection().then(() => {
                        message.timestamp = message.timestamp || (new Date()).toISOString();
                        var event = { message, channel: message.target };
                        pubnub.publish(event, (status, response) => resolve({ status, response }));
                    })
                }
            })
        };

        var trigger = function(key, payload, target = _deviceId, responseKey = "") {
            var message = { key, payload, target, responseKey, source: _deviceId };
            return _trigger(message)
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
                    eventer.trigger("*", event.message.payload, event);
                }
            }
        });
        pubnub.subscribe({ channels: [_deviceId] });

        return {
            _trigger,
            trigger,
            request,
            subscribe: (key, handler) => {
                eventer.on(key, handler)
            },
            unsubscribe(key, handler) {
                eventer.off(key, handler)
            }
        }
    }
}