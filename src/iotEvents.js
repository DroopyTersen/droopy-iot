var EventAggregator = require("droopy-events");
var Firebase = require("firebase");
var Guid = require("guid"); 

var create = function(id) {
	var device = id;
	var url = "https://droopy-iot.firebaseio.com";
	var ref = new Firebase(url);

	var fireBaseEvents = new EventAggregator();

	var setupListeners = function() {
		var newItems = false;

		ref.child("events").orderByChild("timestamp").limitToLast(1).on("child_added", function(snapshot){
			// Workaround to only show new stuff. child_added returns a result for each initial item
			if (!newItems) {
				newItems = true;
				return;
			};
			
			var event = snapshot.val();
			fireBaseEvents.trigger(event.type, event.payload);
			
			// Trigger 'log' for everything.  
			fireBaseEvents.trigger("log", event);
		});
	};

	var subscribe = function(type, cb, target) {
		fireBaseEvents.on(createKey(type,target), cb);
	};

	var unsubscribe = function(type, cb, target) {
		fireBaseEvents.off(createKey(type, target), cb);
	};

	var trigger = function(type, payload, target) {
		ref.child("events").child(Guid.raw()).set(createEvent(type, payload, target));
	};

	var createEvent = function(type, payload, target) {
		target = target || device;
		var timestamp = (new Date()).toISOString();
		return {
			timestamp: timestamp,
			type: createKey(type, target),
			payload: payload,
			source: device,
			target: target
		};
	};
	
	var createKey = function(type, target) {
		if (type === "log") return "log";
		
		target = target || device;
		return target + "/" + type;		
	};
	
	setupListeners();

	// Public Methods
	return { 
		subscribe: subscribe, 
		unsubscribe: unsubscribe, 
		trigger:trigger 
	};
	

};

module.exports = { create: create };