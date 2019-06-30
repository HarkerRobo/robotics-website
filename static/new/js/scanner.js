const scanner = new Instascan.Scanner({
    video: document.getElementById("camera"),
    // continuous: true,
    // mirror: true,
    // refractoryPeriod: 1, //never scan the same code twice.
    // scanPeriod: 1,
});

scanner.addListener("scan", function(content) {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", "qrcode", true);
    xhr.setRequestHeader("Content-Type", "application/json")
    xhr.onload = function() {
        const resp = JSON.parse(xhr.responseText);
        if(resp.success) {
            scanner.stop();
        }
    }
    xhr.send(JSON.stringify({qr: content}));
});

let camera;
Instascan.Camera.getCameras().then(function (cameras) {
    if (cameras.length) {
        camera = cameras[0];
    } else {
      console.error('No cameras found.');
    }
}).catch(function (e) {
    console.error(e);
});

document.getElementById("check-in-button").addEventListener("click", function() {
    scanner.start(camera);
});

document.getElementById("check-out-button").addEventListener("click", function() {
    scanner.start(camera);
});