var i2c = require('i2c');


// Configure 
var address = 0xE0 >> 1;    // Default address
var cmdByte = 0x00;    // Command byte
var lightByte = 0x01;  // Byte to read light sensor
var rangeByte = 0x02;  // Byte for start of ranging data

var wire = new i2c(address, {device: '/dev/i2c-1'});


// Read sonar firmware version
wire.readBytes(cmdByte, 1, function(err, res) {
    console.log('Sonar firmware version: ' + res[0]);
});


function loop() {

    // Initiate ranging
    wire.writeBytes(cmdByte, [0x51], function(err) {});

    // Wait 100 for ranging to complete
    setTimeout(function() {
        wire.readBytes(rangeByte, 2, function(err, res) {
            // result contains a buffer of bytes 
            // first element is range's high byte
            // second is range's low byte
            var range = (res[0] << 8) + res[1];
            console.log('Range in cm: ' + range);
        });
    }, 70);
}

// Measure distance every 500ms
var interval = setInterval(loop, 500);

