var qrdata = "";

function updateQR() {
    QRCode.toCanvas(document.getElementById("qr-canvas"), qrdata + "%" + [...document.querySelectorAll(".attendance-checkbox")].filter(checkbox => checkbox.checked).map(checkbox => checkbox.value).join(","), {
        color: {
            dark: "#000",
            light: "#F0F0F0"
        },
        width: 256,
        height: 256
    });
}

function resetQR() {
    const xhr = new XMLHttpRequest();
    xhr.open("GET", "./attendance/qrcode", true);
    xhr.onload = function() {
        qrdata = JSON.parse(xhr.responseText).data;
        updateQR();
    };
    xhr.send();
}

resetQR();

document.getElementById("check-out-button").addEventListener("click", function() {
    const xhr = new XMLHttpRequest();
    xhr.open("GET", "./attendance/checkOut", true);
    xhr.onload = function() {
        document.getElementById("checkoutbutton").innerHTML = "";
        alert("Checked out");
    
        // document.getElementById("checkoutbutton").innerHTML = "<p id='check-out-message'> Checked out. </p>";
    }
    xhr.send();
});

setInterval(function() {
    location.reload();
}, 1000 * 60 * 60 * 10);