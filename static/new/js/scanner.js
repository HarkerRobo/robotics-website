const scanner = new Instascan.Scanner({
    video: document.getElementById("camera"),
    // continuous: true,
    // mirror: true,
     refractoryPeriod: 5000, //never scan the same code twice.
    // scanPeriod: 1,
});


let camera;
let scanMode;
Instascan.Camera.getCameras().then(function (cameras) {
    if (cameras.length) {
        camera = cameras[0];

        // Set up click handlers only after the cameras have been found, or else InstaScan
        // enters an invalid state stops the scanner from working until you refresh.
        document.getElementById("check-in-button").addEventListener("click", function() {
            scanMode = true;
            scanner.start(camera);
        });
        document.getElementById("check-out-button").addEventListener("click", function() {
            scanMode = false;
            scanner.start(camera);
        });
    } else {
      console.error('No cameras found.');
    }
}).catch(function (e) {
    console.error(e);
});

scanner.addListener("scan", function(content) {
    console.log(content);
    const xhr = new XMLHttpRequest();
    xhr.open("POST", "qrcode", true);
    xhr.setRequestHeader("Content-Type", "application/json")
    xhr.onload = function() {
        const resp = JSON.parse(xhr.responseText);
        if(resp.success) {
            console.log("Successfully scanned");
            scanner.stop();
        } else {
            console.log("Scanning error");
            console.error(resp.error);
        }
    }
    xhr.send(JSON.stringify({qr: content, checkIn: scanMode}));
});