# Droopy IOT Events
Realtime device communication built on top of PubNub.

## Installation
```
npm install droopy-iot
```
### Node.js
```javascript
var droopyIot = require("droopy-iot");
```
### Browser
Just include `/dist/droopyIot.js` on your page.  This will give you `window.droopyIot`
```html
<script src='node_modules/droopy-iot/dist/droopyIot.js'></script>
```
## Example Usage
For more complete example, check out the [demos](https://github.com/DroopyTersen/droopy-iot/tree/master/demo).
```javascript
var iot = droopyIot.register("webserver-1");
iot.subscribe("test-event", (payload) => {
    console.log(payload);
})
iot.trigger("toggle-light", { state: false }, "rasp-pi-1");

// Even supports direct request and response
iot.request("light-state", {}, "rasp-pi-1").then((payload) => {
    console.log(`The light is ${payload.state ? "On" : "Off"}`)
})
```

## API
### `droopyIot.register(deviceId)`
Initial setup method
```javascript
var iot = droopyIot.register("basement-pi");
```

### `trigger(key, payload, targetDevice)`
Sends an event to the targeted device

```javascript
iot.trigger("toggle-light", { state: false }, "basement-pi")
```

### `subscribe(key, handler)`
Attaches a function handler to the specified key. You will only handle events with a matching target device

```javascript
var handlers = {
    toggleLight(payload) { 
        // use payload.state to set GPIO pin
    }
};
iot.subscribe("toggle-light", handlers.toggleLight);
```

### `unsubscribe(key, handler)`
Removes a function handler

```javascript
iot.unsubscribe("toggle-light", handlers.toggleLight);
```

### `request(key, payload, targetDevice)`
Sends a request to a targeted device and returns a promise that will be resolved
when the targeted device responds.  The targeted subscriber can respond 
with `event.respond(payload)`

```javascript
// If we had a web server asking the status of a light in the basement...
var webServerIot = droopyIot.register("webserver-1");
webServerIotiot.request("light-state", null, "basement-pi").then(payload => {
    console.log(payload) //this is the response from basement pi
});

//This is what the raspberry pi in the basement would look like
var basementIot = droopyIot.register("basement-pi");
basementIot.subscribe("light-state", (payload, event) {
    var state = getStateFromGPIO();
    event.respond({state});
});
```