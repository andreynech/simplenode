var i2c = require('i2c');


// Configure 
var srf_address = 0xE0 >> 1;  // Default sonar address
var md22_address = 0xB0 >> 1; // Default motor control board address

// SRF constants
var cmdByte = 0x00;    // Command byte
var lightByte = 0x01;  // Byte to read light sensor
var rangeByte = 0x02;  // Byte for start of ranging data

var sonar = new i2c(srf_address, {device: '/dev/i2c-1'});
var md25 = new i2c(md22_address, {device: '/dev/i2c-1'});

// timer id
var interval = 0;

// Helper function for motor control

function setOperationMode(mode) {
    md25.writeBytes(15, [mode], function(err) {});
}

function stopRotation() {
    md25.writeBytes(0, [128], function(err) {});
    md25.writeBytes(1, [128], function(err) {});
}

function setMotorsWithTurn(speed, turn) {
    md25.writeBytes(0, [speed], function(err) {});
    md25.writeBytes(1, [turn], function(err) {});
}


function loop() {

    // Initiate ranging
    sonar.writeBytes(cmdByte, [0x51], function(err) {});
    setMotorsWithTurn(128 - 30, 128);

    // Wait 70 ms for ranging to complete
    setTimeout(function() {
        sonar.readBytes(rangeByte, 2, function(err, res) {
            // result contains a buffer of bytes 
            // first element is range's high byte
            // second is range's low byte
            var range = (res[0] << 8) + res[1];
            console.log('range: ' + range);
            if(range > 0 && range < 30) {
                turnAway();
            }
        });
    }, 70);
}


function turnAway() {
    console.log('turning away')

    // Stop timer to prevent nested invocations
    // because we need more than 200ms here.
    clearInterval(interval);

    stopRotation();

    // Turn away
    setMotorsWithTurn(128, 128 + 30);

    setTimeout(function() {
        stopRotation();

        // Resume timer
        interval = setInterval(loop, 200);
        console.log('complete turning away')
    }, 1000);
}


setOperationMode(2);
stopRotation();

// Measure distance every 100ms and avoid obsticle if detected
interval = setInterval(loop, 200);


process.on('SIGINT', function() {
    console.log('Stopping motors and exiting...');
    clearInterval(interval);
    stopRotation();
    process.exit();
});

