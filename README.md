# Droopy IOT Events
Realtime pubsub using pubnub

## Installation
```
npm install droopy-iot
```

## Usage
### Node.js Server
```javascript
var iot = require("droopy-iot").register("webserver-1");
iot.subscribe("test-event", (payload) => {
    console.log(payload);
})
iot.trigger("toggle-light", { state: false }, "rasp-pi-1");
```

## API
`droopyIot.register(deviceId)` - Initial setup method
```javascript
var iot = droopyIot.register("basement-pi");
```

`trigger(key, payload, targetDevice)` - Sends an event to the targeted device
```javascript
iot.trigger("toggle-light", { state: false }, "basement-pi")
```
`subscribe(key, handler)` - Attaches a function handler to the specified key. You will only handle events with a matching target device
```javascript
var handlers = {
    toggleLight(payload) { 
        // use payload.state to set GPIO pin
    }
};
iot.subscribe("toggle-light", handlers.toggleLight);
```
`unsubscribe(key, handler)` - Removes a function handler
```javascript
iot.unsubscribe("toggle-light", handlers.toggleLight);
```
