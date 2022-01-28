const scanner = new Instascan.Scanner({
    video: document.getElementById("camera"),
    // continuous: true,
    mirror: getComputedStyle(document.getElementById("dummy")).display != "none",
     refractoryPeriod: 5000, //never scan the same code twice.
    // scanPeriod: 1,
});

this.console.log(getComputedStyle(document.getElementById("dummy")).display);
let cameras = [];
let currentCamera = 0;
let scanMode;
Instascan.Camera.getCameras().then(function (_cameras) {
    if (_cameras.length) {
        cameras = _cameras;

        // Set up click handlers only after the cameras have been found, or else InstaScan
        // enters an invalid state stops the scanner from working until you refresh.
        document.getElementById("check-in-button").addEventListener("click", function() {
            scanMode = true;
            scanner.start(cameras[currentCamera]);
            document.getElementById("toggle-camera").style.display = "initial";
            document.getElementById("scanner-message").style.display = "none";
            document.getElementById("user-photo").style.display = "none";
        });
        document.getElementById("check-out-button").addEventListener("click", function() {
            scanMode = false;
            scanner.start(cameras[currentCamera]);
            document.getElementById("toggle-camera").style.display = "initial";
            document.getElementById("scanner-message").style.display = "none";
            document.getElementById("user-photo").style.display = "none";
        });
    } else {
      console.error('No cameras found.');
    }
}).catch(function (e) {
    console.error(e);
});

function scan(content) {
    console.log(content);
    const xhr = new XMLHttpRequest();
    xhr.open("POST", "qrcode", true);
    xhr.setRequestHeader("Content-Type", "application/json")
    xhr.onload = function() {
        const resp = JSON.parse(xhr.responseText);
        if(resp.success) {
            console.log(`Successfully scanned ${resp.name}.`);
            document.getElementById("scanner-message").style.color = "green";
            document.getElementById("scanner-message").style.display = "block";
            document.getElementById("user-photo").style.display = "block";
            document.getElementById("toggle-camera").style.display = "none";
            document.getElementById("scanner-message").innerHTML = `Successfully scanned ${resp.name}.`
            document.getElementById("user-photo").setAttribute("src", `/member/attendance/photos/${resp.username}`);
            scanner.stop();
        } else {
            console.log("Scanning error");
            document.getElementById("scanner-message").style.color = "red";
            document.getElementById("scanner-message").style.display = "block";
            document.getElementById("user-photo").style.display = "none";
            document.getElementById("toggle-camera").style.display = "none";
            document.getElementById("scanner-message").innerHTML = resp.error;
            scanner.stop();
            console.error(resp.error);
        }
    }
    xhr.send(JSON.stringify({qr: content, checkIn: scanMode}));
}

scanner.addListener("scan", function(content) {
    scan(content);
});

document.getElementById("toggle-camera").addEventListener("click", function() {
    currentCamera = ++currentCamera % cameras.length;
    scanner.start(cameras[currentCamera]);
    document.getElementById("toggle-camera").style.display = "initial";
    let content = scanner.scan();
    if(content != null) {
        scan(content);
    }
    setTimeout(() => {
        content = scanner.scan();
        if(content != null) {
            scan(content);
        }
    }, 1000);
})
