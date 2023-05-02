"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("grage-lib/client");
const esp8266_1 = require("grage-lib/esp8266");
const device_id_json_1 = require("./device_id.json");
const host = "grage.azurewebsites.net";
const grage = client_1.default(host, function onTerminate(reason) {
    console.log('[Terminated]', reason);
});
//esp constants
const sensorPin = esp8266_1.default.Pin.D6, controlPin = esp8266_1.default.Pin.D7;
grage.onOpen(() => {
    console.log('connected to server');
    // Begin receiving data from device
    grage.connect(device_id_json_1.deviceID, function onDeviceData(data) {
        console.log('received data from device:');
        const sense = data.pinReadings[sensorPin];
        if (sense === esp8266_1.default.LogicLevel.HIGH) {
            console.log('door is open');
        }
        else {
            console.log('door is closed');
        }
    });
    //when device becomes alive, run initialization stuff
    //such as setting up inputs, outputs and interrupts
    grage.onAlive(device_id_json_1.deviceID, function alive() {
        console.log('device is online');
        //enable input then read
        grage.send(device_id_json_1.deviceID, esp8266_1.default.pinMode(sensorPin, esp8266_1.default.PinMode.INPUT_PULLUP));
        grage.send(device_id_json_1.deviceID, esp8266_1.default.attachInterrupt(sensorPin, esp8266_1.default.InterruptMode.CHANGE));
        //enable output, make sure it is off
        grage.send(device_id_json_1.deviceID, esp8266_1.default.pinMode(controlPin, esp8266_1.default.PinMode.OUTPUT));
        grage.send(device_id_json_1.deviceID, esp8266_1.default.digitalWrite(controlPin, esp8266_1.default.LogicLevel.LOW));
    });
    //when device becomes dead, disable ui again
    grage.onDead(device_id_json_1.deviceID, function dead() {
        console.log('device offline');
    });
});
// call this function to open/close door
function openCloseDoor() {
    //send 100ms pulse to garage door switch
    grage.send(device_id_json_1.deviceID, esp8266_1.default.digitalWrite(controlPin, esp8266_1.default.LogicLevel.HIGH));
    setTimeout(() => {
        grage.send(device_id_json_1.deviceID, esp8266_1.default.digitalWrite(controlPin, esp8266_1.default.LogicLevel.LOW));
    }, 100);
}
//# sourceMappingURL=index.js.map