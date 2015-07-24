var i2c = require('i2c');

// Configure 
var address = 0xB0 >> 1;
// point to your i2c address, debug provides REPL interface
var wire = new i2c(address, {device: '/dev/i2c-1'});

// Helper function for motor control

function setOperationMode(mode) {
    wire.writeBytes(0, [mode], function(err) {});
}

function stopRotation() {
    wire.writeBytes(1, [128], function(err) {});
    wire.writeBytes(2, [128], function(err) {});
}

function setMotorsWithTurn(speed, turn) {
    wire.writeBytes(1, [speed], function(err) {});
    wire.writeBytes(2, [turn], function(err) {});
}

// Rotate motors forward and backward

console.log('Start');

setOperationMode(4);
stopRotation();

setMotorsWithTurn(150, 128);

setTimeout(function() {
    stopRotation();

    setMotorsWithTurn(100, 128);

    setTimeout(function() {
        stopRotation();
        console.log('Done.');
    }, 2000);

}, 2000);

