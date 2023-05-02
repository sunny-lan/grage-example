import makeClient from 'grage-lib/client'
import esp8266 from 'grage-lib/esp8266'
import {deviceID} from "./device_id.json";

const host =  "grage.azurewebsites.net";
const grage = makeClient(host, function onTerminate(reason) {
    console.log('[Terminated]', reason);
});
//esp constants
const sensorPin = esp8266.Pin.D6, controlPin = esp8266.Pin.D7;

grage.onOpen(() => {
    console.log('connected to server')

    // Begin receiving data from device
    grage.connect(deviceID, function onDeviceData(data) {
        console.log('received data from device:')
        const sense = data.pinReadings[sensorPin];
        if (sense === esp8266.LogicLevel.HIGH) {
            console.log('door is open')
        } else {
            console.log('door is closed')
        }
    });

    //when device becomes alive, run initialization stuff
    //such as setting up inputs, outputs and interrupts
    grage.onAlive(deviceID, function alive() {
        console.log('device is online')
        //enable input then read
        grage.send(deviceID, esp8266.pinMode(sensorPin, esp8266.PinMode.INPUT_PULLUP));
        grage.send(deviceID, esp8266.attachInterrupt(sensorPin, esp8266.InterruptMode.CHANGE));

        //enable output, make sure it is off
        grage.send(deviceID, esp8266.pinMode(controlPin, esp8266.PinMode.OUTPUT));
        grage.send(deviceID, esp8266.digitalWrite(controlPin, esp8266.LogicLevel.LOW));
    });

    //when device becomes dead, disable ui again
    grage.onDead(deviceID, function dead() {
        console.log('device offline')
    });
});

// call this function to open/close door
function openCloseDoor() {
    //send 100ms pulse to garage door switch
    grage.send(deviceID, esp8266.digitalWrite(controlPin, esp8266.LogicLevel.HIGH));
    setTimeout(() => {
        grage.send(deviceID, esp8266.digitalWrite(controlPin, esp8266.LogicLevel.LOW));
    }, 100);
}